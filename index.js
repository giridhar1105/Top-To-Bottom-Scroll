gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

smoothScroll("#content");

function mountainPara() {
  gsap.timeline({
    scrollTrigger: {
      trigger: "#Mountain-Scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: true
    }
  })
  .from("#Sky", { y: 0 }, 0)
  .fromTo("#Mountain-Top", { y: 150 }, { y: -300 }, 0)
  .fromTo("#Mountain-Middle", { y: 350 }, { y: -300 }, 0)
  .fromTo("#Mountain-Bottom", { y: 500 }, { y: -300 }, 0);
}

function snowboardPara() {
  let direction = 1,
      isRefreshing = false,
      heroGetter = gsap.getProperty("#hero"),
      heroSetter = gsap.quickSetter("#hero", "rotation", "deg"),
      rotation = { base: heroGetter("rotation"), extra: -180 },
      addRotation = () => {
        rotation.base = heroGetter("rotation");
        heroSetter(rotation.base + rotation.extra);
      };

  gsap.set("#hero", { scale: 0.7, autoAlpha: 1, transformOrigin: "50% 50%" });

  gsap.to("#hero", {
    motionPath: {
      path: "#trail",
      align: "#trail",
      autoRotate: 90,
      alignOrigin: [0.5, 0.5]
    },
    onUpdate: addRotation,
    immediateRender: true,
    ease: "power2.inOut",  // Changed easing
    scrollTrigger: {
      trigger: "#Boarder-Scroll",
      start: "top 100",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: () => isRefreshing = true,
      onUpdate: self => {
        if (isRefreshing) {
          direction = self.direction; // Maintain direction during refresh
        } else if (direction !== self.direction) {
          direction = self.direction;
          gsap.to(rotation, {
            extra: direction === 1 ? -180 : 0,
            ease: "power1.inOut",
            onUpdate: () => heroSetter(rotation.base + rotation.extra),
            overwrite: true
          });
        }
      },
      onRefresh: () => {
        isRefreshing = false;
        if (heroGetter("rotation") === rotation.base) {
          addRotation();
        }
      }
    }
  });
}

// Smooth scroll function
function smoothScroll(content, viewport, smoothness) {
  content = gsap.utils.toArray(content)[0];

  gsap.set(viewport || content.parentNode, {
    overflow: "hidden",
    position: "fixed",
    height: "100%",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  gsap.set(content, { overflow: "visible", width: "100%" });

  let getProp = gsap.getProperty(content),
      setProp = gsap.quickSetter(content, "y", "px"),
      removeScroll = () => content.style.overflow = "visible",
      needsRefreshFix = parseFloat(ScrollTrigger.version.split(".").map(n => ("00" + n).substr(n.length - 1, 3)).join("")) < 3006002,
      height;

  function onResize() {
    height = content.clientHeight;
    content.style.overflow = "visible";
    document.body.style.height = height + "px";
  }
  onResize();
  ScrollTrigger.addEventListener("refreshInit", onResize);
  ScrollTrigger.addEventListener("refresh", () => {
    removeScroll();
    requestAnimationFrame(removeScroll);
  });

  ScrollTrigger.defaults({ scroller: content });

  ScrollTrigger.prototype.update = p => p;

  ScrollTrigger.scrollerProxy(content, {
    scrollTop(value) {
      return arguments.length ? setProp(-value) : -getProp("y");
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    }
  });

  gsap.fromTo(content, { y: 0 }, {
    y: () => document.documentElement.clientHeight - height,
    ease: "none",
    onUpdate: ScrollTrigger.update,
    scrollTrigger: {
      scroller: window,
      invalidateOnRefresh: true,
      start: 0,
      end: () => height - document.documentElement.clientHeight,
      scrub: smoothness || 3,
      onRefresh: self => {
        gsap.killTweensOf(self.animation);
        self.animation.progress(self.progress);
        if (needsRefreshFix) {
          let all = ScrollTrigger.getAll();
          all.slice(all.indexOf(self) + 1).forEach(t => t.refresh());
        }
      }
    }
  });
}

window.addEventListener("load", function(event) {
  mountainPara();
  snowboardPara();
});
