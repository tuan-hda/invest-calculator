import Script from "next/script";

const CHATWOOT_BASE_URL =
  "https://chatwoottuan.southeastasia.cloudapp.azure.com";
const CHATWOOT_WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;

export function ChatwootWidget() {
  if (!CHATWOOT_WEBSITE_TOKEN) {
    return null;
  }

  return (
    <Script
      id="chatwoot-widget"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(d,t) {
            var BASE_URL="${CHATWOOT_BASE_URL}";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.defer = true;
            g.async = true;
            s.parentNode.insertBefore(g,s);
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: '${CHATWOOT_WEBSITE_TOKEN}',
                baseUrl: BASE_URL
              });
            };
          })(document,"script");
        `,
      }}
    />
  );
}
