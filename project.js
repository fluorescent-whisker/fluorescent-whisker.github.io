(() => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const videos = [...document.querySelectorAll("#hero-video, .demo-video")];
  const summary = document.getElementById("main-video");
  const buttons = [...document.querySelectorAll("[data-video]")];
  const manuallyPaused = new Set();
  const inView = new Set();
  function update(video) {
    const button = buttons.find((b) => b.dataset.video === video.id);
    if (!button) return;
    const label = video.id === "hero-video" ? "video" : "demo";
    button.textContent = `${video.paused ? "Play" : "Pause"} ${label}`;
    button.setAttribute(
      "aria-label",
      `${video.paused ? "Play" : "Pause"} ${label}`,
    );
  }
  function play(video) {
    const promise = video.play();
    if (promise) promise.catch(() => update(video));
  }
  videos.forEach((video) => {
    video.addEventListener("play", () => update(video));
    video.addEventListener("pause", () => update(video));
    if (preference.matches) video.pause();
    update(video);
  });
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const video = document.getElementById(button.dataset.video);
      if (video.paused) {
        manuallyPaused.delete(video);
        play(video);
      } else {
        manuallyPaused.add(video);
        video.pause();
      }
    }),
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            inView.add(video);
            if (
              !preference.matches &&
              !manuallyPaused.has(video) &&
              !document.hidden
            )
              play(video);
          } else {
            inView.delete(video);
            video.pause();
          }
        }),
      { threshold: 0.2 },
    );
    videos.forEach((video) => observer.observe(video));
    if (summary) {
      const summaryObserver = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) summary.pause();
        },
        { threshold: 0 },
      );
      summaryObserver.observe(summary);
    }
  }
  preference.addEventListener("change", () => {
    if (preference.matches) videos.forEach((video) => video.pause());
    else
      inView.forEach((video) => {
        if (!manuallyPaused.has(video)) play(video);
      });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos.forEach((video) => video.pause());
      if (summary) summary.pause();
    } else if (!preference.matches)
      inView.forEach((video) => {
        if (!manuallyPaused.has(video)) play(video);
      });
  });
})();
