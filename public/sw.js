if(!self.define){let e,s={};const i=(i,t)=>(i=new URL(i+".js",t).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(t,c)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let n={};const r=e=>i(e,a),o={module:{uri:a},exports:n,require:r};s[a]=Promise.all(t.map((e=>o[e]||r(e)))).then((e=>(c(...e),n)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/404.html",revision:"0a27a4163254fc8fce870c8cc3a3f94f"},{url:"/_next/app-build-manifest.json",revision:"49182477e7f0659beac031d8226ca0b0"},{url:"/_next/static/XJsth1A1MmCGQXPGcvUti/_buildManifest.js",revision:"1993f11a66956258b20731e9d6642a77"},{url:"/_next/static/XJsth1A1MmCGQXPGcvUti/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1055-47c35417248ccac1.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/1181-f727aa699cd3f164.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/1517-3f6887e7a14e215b.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/2193-bb8b3f6546911216.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/2695-304d20fea5376494.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/3778-6523ebdb231cf0b1.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/3937-0460034b51cb8244.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/4205-a92261c9934b5a72.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/4bd1b696-9b3f8875c1f3e853.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/5037-bf725c0901838a22.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/5203.f4b97ab553880bca.js",revision:"f4b97ab553880bca"},{url:"/_next/static/chunks/5204-4721f9b2e9f764f4.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/5457-a970a08242e905ae.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/5565-de4f01030ae803dc.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/6218.ec477fe67fb19468.js",revision:"ec477fe67fb19468"},{url:"/_next/static/chunks/6327-4be43d143f3b8e90.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/6364-647fe5bdcf4ce52d.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/6735.6b0db44e42de8b9e.js",revision:"6b0db44e42de8b9e"},{url:"/_next/static/chunks/6838-92a1b713b53be477.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/8173-d08201998c48ef9b.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/905-b8f7e1619d4c00a7.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/966-52dc9245cc46fcbc.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/a6eb9415-f82e80c374375941.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/businesses/page-7ab17471c432f087.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/bookings/page-ae9acfab6ada4585.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/calendar/page-4ecc7f7af2bdec48.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/page-22136ca09f27eb0c.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/services/%5Baction%5D/page-acb5e91272a4d295.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/services/add/page-e84fdad4fa89bc09.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/services/page-5e9f13bd8cf9ffb5.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/business/settings/page-ff40d3785c9f1a25.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/customer/page-ebb6c09f8b60ebe8.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/dashboard/customer/settings/page-2daab1dec1c2e9d0.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/error/page-e5977ded25694081.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/layout-1a8d33de279246b0.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/services/%5Bid%5D/page-2b8611feeaf54e30.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(app)/services/page-7bd973fe8eb6d7e7.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(auth)/forgot-password/page-7e8fbb6ea3497344.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(auth)/layout-87d81c4328158271.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(auth)/login/page-76ce2fc2bd8e971a.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(auth)/register/page-f988e3a9a0dc1032.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(auth)/reset-password/page-f429c61b4e348898.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/(auth)/verify-email/page-f9b5a326a9047720.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/_not-found/page-8357467311033b1f.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/android/app/build/outputs/apk/release/route-3d4f6e8c88fe7d71.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/api/businesses/route-cc972a672345931e.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/api/send-verification-email/route-f136e5fc129466ba.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/api/services/route-379d13809fc0f625.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/api/verify-email/route-dbbf0b62241b2ac4.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/auth/callback/route-f2444444a46385f1.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/auth/google/callback/route-5bc8952b09718e14.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/auth/v1/callback/route-c85e938a0567bdc5.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/layout-ea304b05d2f0ccbf.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/onboarding/business/page-176cd5cf575a713f.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/onboarding/page-9aed12653b9d94d8.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/app/page-3df54a9a2d311972.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/framework-f840e08b65b2bbef.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/main-9bff1784220da9d1.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/main-app-9a32412a9bcf0c93.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/pages/_app-8fa6af697a78d474.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/pages/_error-00409b70658ebea4.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-2e7f9ba6644e2bea.js",revision:"XJsth1A1MmCGQXPGcvUti"},{url:"/_next/static/css/73162c02b289bcdf.css",revision:"73162c02b289bcdf"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/categories/beauty.jpg",revision:"3f7b5e0af9795282d15cce797a023297"},{url:"/categories/fitness.jpg",revision:"3f7b5e0af9795282d15cce797a023297"},{url:"/categories/home.jpg",revision:"3f7b5e0af9795282d15cce797a023297"},{url:"/categories/professional.jpg",revision:"3f7b5e0af9795282d15cce797a023297"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/hero-image.svg",revision:"c04f5fc51747a40ebfc3e34bf0766192"},{url:"/icons/icon-128x128.png",revision:"0947a4665c09ce9e8c3e39df41585f4a"},{url:"/icons/icon-144x144.png",revision:"463f6e492f728c64e0723b7a00de66a2"},{url:"/icons/icon-152x152.png",revision:"c08584ac863fa9f74995336f40520264"},{url:"/icons/icon-192x192.png",revision:"41c802d20e35e1e5bdcbe9230f81a01c"},{url:"/icons/icon-256x256.png",revision:"5da4aa080f0fbc151b00c31d73a4048c"},{url:"/icons/icon-384x384.png",revision:"715a7829ec965c775d7d8f13d42e6803"},{url:"/icons/icon-48x48.png",revision:"b0aebd84fdcfc790de0a624fa7aba281"},{url:"/icons/icon-512x512.png",revision:"bf0c86946c03e6483f0f777293b62c0a"},{url:"/icons/icon-72x72.png",revision:"1372128d98fb6352f01e28b2ce3b5944"},{url:"/icons/icon-96x96.png",revision:"0f85ee80bc4fde0353814fd3742fd4fd"},{url:"/images/placeholder/service.jpg",revision:"768ce6c855646ac669f851fe0c5f8e81"},{url:"/images/services/facial.jpg",revision:"768ce6c855646ac669f851fe0c5f8e81"},{url:"/images/services/haircut.jpg",revision:"768ce6c855646ac669f851fe0c5f8e81"},{url:"/images/services/massage.jpg",revision:"768ce6c855646ac669f851fe0c5f8e81"},{url:"/index.html",revision:"c0e36130eb4820ddc77c12b681d354c5"},{url:"/logo.svg",revision:"28fafe3f379d73f97a3d10a0bb9dee85"},{url:"/manifest.json",revision:"4a8e849c87ddf40adfd5fb0dd339a6b6"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
