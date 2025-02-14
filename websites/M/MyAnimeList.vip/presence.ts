const presence = new Presence({
    clientId: "861544419005169675"
  }),
  browsingTimestamp = Math.floor(Date.now() / 1000);

let iframeData: {
  currTime: number;
  duration: number;
  paused: boolean;
} = null;

presence.on(
  "iFrameData",
  (data: { currTime: number; duration: number; paused: boolean }) => {
    if (!data.paused) iframeData = data;
  }
);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "logo",
      startTimestamp: browsingTimestamp
    },
    { pathname } = document.location;

  if (pathname === "/") {
    presenceData.details = document.location.search
      ? `Procurando por ${document.location.search.substring(3)}`
      : "Explorando MyAnimeList.vip";
  } else if (pathname === "/animes-legendado")
    presenceData.details = "Procurando por Legendados";
  else if (pathname === "/animes-dublado")
    presenceData.details = "Procurando por Dublados";
  else if (pathname === "/filme")
    presenceData.details = "Procurando por Filmes";
  else if (pathname.startsWith("/lancamento"))
    presenceData.details = "Últimos Lancamentos";
  else if (
    pathname.startsWith("/animes/") ||
    pathname.startsWith("/episodio/")
  ) {
    if (!document.querySelector("iframe")) {
      const title: HTMLHeadingElement = document.querySelector(
        "section.titlePosts > h1"
      );
      presenceData.details = "Vendo Sinopse";
      if (title) presenceData.state = title.textContent;
      presenceData.buttons = [
        {
          label: "Ver Sinopse",
          url: document.location.href
        }
      ];
    } else {
      const title: HTMLHeadingElement = document.querySelector(
        "section.titlePost > h1"
      );
      if (title) {
        presenceData.details = title.textContent.substring(
          0,
          title.textContent.indexOf("Episódio")
        );
        presenceData.state = title.textContent.substring(
          title.textContent.indexOf("Episódio")
        );
      }
      if (iframeData && !iframeData.paused) {
        [, presenceData.endTimestamp] = presence.getTimestamps(
          iframeData.currTime,
          iframeData.duration
        );
      }
      presenceData.buttons = [
        {
          label: "Assistir o Episódio",
          url: document.location.href
        }
      ];
    }
  }

  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});
