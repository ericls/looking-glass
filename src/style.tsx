import jss from "https://esm.sh/jss@10.7.1";
import jssPreset from "https://esm.sh/jss-preset-default@10.7.1";
import color from "https://esm.sh/color@4.0.1";


jss.setup(jssPreset());

const bgColor = '#f5f5f5';
const bodyColor = '#555';
const pageHeaderColor = "#505050";
const linkColor = '#2fa4e7';
const headerColor = pageHeaderColor;

export const sheet = jss
  .createStyleSheet({
    "@global": {
      "*, *:before, *:after": {
        boxSizing: "border-box",
      },
      "a": {
        color: linkColor,
        "&:hover": {
          color: color(linkColor).darken(0.2).toString(),
        }
      },
    },
    heading: {
      fontFamily: "Poppins,Arial,sans-serif",
      fontWeight: "600",
      margin: 0,
      lineHeight: "1em",
    },
    body: {
      margin: 0,
      fontFamily: "Helvetica Neue,Helvetica,Arial,sans-serif",
      fontSize: "16px",
      lineHeight: "20px",
      backgroundColor: bgColor,
      color: bodyColor,
    },
    container: {
      margin: "auto",
      width: "960px",
      maxWidth: "90%",
    },
    box: {
      padding: "1rem",
      backgroundColor: "#fff",
      borderRadius: "7px",
      marginBottom: "1rem",
      boxShadow: '0px 0px 4px 0px #dcdcdc',
    },
    pageHeader: {
      composes: "$heading",
      fontSize: "2rem",
      color: pageHeaderColor,
      textDecoration: "none",
      marginBottom: "1rem",
    },
    h3: {
      composes: "$heading",
      fontSize: "1.4rem",
      marginBottom: "1rem",
    },
    dataList: {},
    dataItem: {
      display: "flex",
      alignItems: "center",
      marginTop: '0.125rem',
    },
    networkTestsForm: {
      display: "flex",
      alignItems: "center",
      gap: '0.5rem',
      fontSize: '1rem',
      marginBottom: '0',
      '& input, & select, & button': {
        fontSize: '0.875rem',
        padding: '0.25rem',
        height: '28px',
      },
    },
    resultBox: {
      fontFamily: "monospace",
      fontSize: 14,
      padding: '0.5rem',
      backgroundColor: bgColor,
      borderRadius: 7,
      marginBottom: 0,
      overflow: "auto",
    },
    dataLabel: {
      minWidth: "8rem",
    },
    dataValue: {
      flexGrow: 1,
    },
    files: {
      "& $dataValue": {
        display: "flex",
        gap: "0.25rem",
      }
    },
    linkList: {
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
    },
    linkItem: {
      display: "inline-block",
      textDecoration: "none",
    },
    layout: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      paddingTop: "1rem",
      "& main": {
        flexGrow: 1,
      },
    },
    footer: {
      composes: "$container",
      display: "flex",
      margin: "1rem auto",
      alignItems: "center",
      justifyContent: "space-between",
    },
    footerLeft: {},
    footerRight: {},
  })
  .attach();
