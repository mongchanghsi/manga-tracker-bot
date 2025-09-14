export type ComickPropsResponse = {
  props: {
    pageProps: {
      comic: ComickDataResponse;
    };
  };
  page: string;
  query: { slug: string };
  buildId: string;
  assetPrefix: string;
  isFallback: boolean;
  isExperimentalCompile: boolean;
  gsp: boolean;
  scriptLoader: {
    src: string;
    strategy: string;
    async: boolean;
  }[];
};

type ComickDataResponse = {
  id: number;
  hid: string;
  title: string;
  country: string;
  status: number;
  links: {
    al: string;
    ap: string;
    bw: string;
    kt: string;
    mb: string;
    mu: string;
    amz: string;
    cdj: string;
    ebj: string;
    mal: string;
    raw: string;
    engtl: string;
  };
  last_chapter: string;
};
