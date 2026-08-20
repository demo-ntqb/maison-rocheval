import Script from 'next/script';

const BUILD_TIME = new Date().getTime().toString();

export function HeadAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTIC_ID;
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || BUILD_TIME;

  return (
    <>
      {commitSha && <meta name='appversion' content={commitSha} />}

      {gaId && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script id='google-analytics'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
