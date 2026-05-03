type AnalyticsParams = Record<string, unknown>;
type ConsentState = "granted" | "denied" | "pending";

const CONSENT_STORAGE_KEY = "analytics-consent";
const GA_SCRIPT_ID = "ga4-script";
const GTM_SCRIPT_ID = "gtm-script";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();
  const gaMeasurementId = config.public.gaMeasurementId;
  const gtmContainerId = config.public.gtmContainerId;
  const consent = useState<ConsentState>(
    "analytics-consent-state",
    () => "granted",
  );

  const ensureDataLayer = () => {
    if (!Array.isArray(window.dataLayer)) {
      window.dataLayer = [];
    }
  };

  const loadScript = (id: string, src: string) => {
    if (document.getElementById(id)) {
      return;
    }

    const scriptTag = document.createElement("script");
    scriptTag.id = id;
    scriptTag.async = true;
    scriptTag.src = src;
    document.head.appendChild(scriptTag);
  };

  const bootGoogleAnalytics = () => {
    if (!gaMeasurementId) {
      return;
    }

    loadScript(
      GA_SCRIPT_ID,
      `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
    );

    ensureDataLayer();

    if (typeof window.gtag !== "function") {
      window.gtag = (...args: unknown[]) => {
        window.dataLayer.push(args as unknown as Record<string, unknown>);
      };
      window.gtag("js", new Date());
      window.gtag("config", gaMeasurementId, { send_page_view: false });
    }
  };

  const bootGoogleTagManager = () => {
    if (!gtmContainerId || document.getElementById(GTM_SCRIPT_ID)) {
      return;
    }

    ensureDataLayer();
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });

    const scriptTag = document.createElement("script");
    scriptTag.id = GTM_SCRIPT_ID;
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtm.js?id=${gtmContainerId}`;
    document.head.appendChild(scriptTag);
  };

  const initializeAnalytics = () => {
    if (consent.value !== "granted") {
      return;
    }

    bootGoogleAnalytics();
    bootGoogleTagManager();
  };

  const trackPageView = (path: string) => {
    if (
      consent.value !== "granted" ||
      !gaMeasurementId ||
      typeof window.gtag !== "function"
    ) {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaMeasurementId,
    });
  };

  const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
    if (consent.value !== "granted") {
      return;
    }

    ensureDataLayer();

    window.dataLayer.push({
      event: eventName,
      ...params,
      ga_measurement_id: gaMeasurementId,
      gtm_container_id: gtmContainerId,
    });
  };

  const setConsent = (nextConsent: Exclude<ConsentState, "pending">) => {
    consent.value = nextConsent;
    window.localStorage.setItem(CONSENT_STORAGE_KEY, nextConsent);

    if (nextConsent === "granted") {
      initializeAnalytics();
      trackPageView(router.currentRoute.value.fullPath);
      trackEvent("analytics_consent_granted", {
        consent_source: "banner",
      });
    }
  };

  nuxtApp.hook("app:mounted", () => {
    consent.value = "granted";
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");

    initializeAnalytics();
    trackPageView(router.currentRoute.value.fullPath);
  });

  router.afterEach((to) => {
    trackPageView(to.fullPath);
  });

  return {
    provide: {
      analytics: {
        consent,
        setConsent,
        trackEvent,
        trackPageView,
      },
    },
  };
});
