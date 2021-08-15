import cx from "https://esm.sh/classnames@2.3.1";
import React from "https://esm.sh/react@17.0.2?dts";
import { sheet } from "../style.tsx";
import { useOakContext } from "./context.tsx";
import { NetworkTests } from "./networkTests.tsx";
import { DataItem } from "./misc.tsx";
import { SIZES } from "../fileServ.ts";

export default function LookingGlass() {
  const oakContext = useOakContext();
  return (
    <body className={sheet.classes.body}>
      <div className={sheet.classes.container}>
        <h1 className={sheet.classes.pageHeader}>
          {window.siteSettings.sitePageHeader}
        </h1>
        <div className={sheet.classes.box}>
          <h3 className={cx(sheet.classes.h3)}>Network Information</h3>
          <div className={sheet.classes.dataList}>
            <DataItem
              label={"Server location"}
              value={<b>{window.siteSettings.serverLocation}</b>}
            />
            {window.siteSettings.ipAddress.map(({ label, value }) => {
              return <DataItem label={label} value={value} />;
            })}
            <DataItem
              label={"Your IP address"}
              value={<b>{oakContext.request.ip}</b>}
            />
            {!!oakContext.request.ips.length && (
              <DataItem
                label={"Proxy"}
                value={JSON.stringify(oakContext.request.ips)}
              />
            )}
            <DataItem
              className={sheet.classes.files}
              label={"File download"}
              value={SIZES.map(([name, _]) => (
                <a
                  href={`/file/${name}.test`}
                  className={sheet.classes.linkItem}
                >
                  {name}
                </a>
              ))}
            />
          </div>
        </div>
        <div className={sheet.classes.box} id="ntest">
          <NetworkTests />
        </div>
        {!!window.siteSettings.links.length && (
          <div className={sheet.classes.box}>
            <h3 className={cx(sheet.classes.h3)}>Links</h3>
            <div className={sheet.classes.linkList}>
              {window.siteSettings.links.map(({ title, href }) => {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={sheet.classes.linkItem}
                  >
                    {title}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </body>
  );
}
