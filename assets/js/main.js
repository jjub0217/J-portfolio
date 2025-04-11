window.onload = function () {

  const sectionVisual = document.querySelector(".section_visual video");
  const visualHeadline = document.querySelector(".section_visual .headline");
  const visualDesc = document.querySelector(".section_visual .desc_wrap");
  const mailLink = document.querySelector(".section_visual .mail_link");
  const header = document.querySelector(".header");


  const tl = gsap.timeline();

  tl.addLabel("a")
    .to(
      visualHeadline,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      },
      "a"
    )
    .to(
      visualDesc,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      },
      "a"
    )
    .addLabel("b", "-=0.5")
    .to(
      mailLink,
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "b"
    )
    .to(
      header,
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "b"
    )
    .addLabel("c", "-=0.3")
    .to(
      sectionVisual,
      {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      },
      "c"
    );

};



const contentWrap = gsap.timeline({
  scrollTrigger: {
    trigger: ".content_wrap",
    scrub: 1,
    start: "0% 80%",
    end: "0% 0%",
    // markers: false,
  },
});
contentWrap.to(".section_visual", { opacity: 0 });

const goalBoxes = document.querySelectorAll(".goal_box");
const worksBoxes = document.querySelectorAll(".works_box");

ScrollTrigger.matchMedia({
  "(min-width: 850px)": function () {
    goalBoxes.forEach((goalBox, index) => {
      const bar = goalBox.querySelector(".bar");
      gsap.to(goalBox, {
        scrollTrigger: {
          trigger: goalBox,
          start: "top 50%",
          end: "top 50%",
          onEnter: () => goalBox.classList.add("is_active"),
          onLeaveBack: () => goalBox.classList.remove("is_active"),
          // markers: false,
        },
      });

      if (!bar) return;
      const initialTranslateY = -100 - index * 2 * 10;
      gsap.set(bar, { y: `${initialTranslateY}%` });
      gsap.to(bar, {
        scrollTrigger: {
          trigger: goalBox,
          start: "top 50%",
          end: "bottom 50%",
          scrub: true,
          // markers: false,
        },
        y: "0%",
      });
    });

    worksBoxes.forEach((workBox) => {
      const activeWork = workBox.querySelector(".work_link.is_active");
      const scaleWork = workBox.querySelector(".work_link.is_scale");
      gsap.to(activeWork, {
        scrollTrigger: {
          trigger: workBox,
          start: "top 100%",
          end: "bottom 100%",
          // markers: false,
          scrub: true,
        },
        y: "0%",
      });
      gsap.to(scaleWork, {
        scrollTrigger: {
          trigger: workBox,
          start: "top 100%",
          end: "bottom 100%",
          // markers: false,
          scrub: true,
        },
        width: "100%",
      });
    });

  },

  "(max-width: 850px)": function () {
  goalBoxes.forEach((goalBox, index) => {
    const bar = goalBox.querySelector(".bar");
    gsap.to(goalBox, {
      scrollTrigger: {
        trigger: goalBox,
        start: "top 80%",
        end: "top 50%",
        onEnter: () => goalBox.classList.add("is_active"),
        onLeaveBack: () => goalBox.classList.remove("is_active"),
        // markers: false,
      },
    });

    if (!bar) return;
    const initialTranslateY = -100 - index * 2 * 10;
    gsap.set(bar, { y: `${initialTranslateY}%` });
    gsap.to(bar, {
      scrollTrigger: {
        trigger: goalBox,
        start: "top 80%",
        end: "bottom 50%",
        scrub: true,
        // markers: false,
      },
      y: "0%",
    });
  });
  },
});





const panels = document.querySelectorAll(".panel");
const topPanel = document.querySelector(".works_thumbnail");

gsap.to(panels, {
  xPercent: -50 * (panels.length - 1),
  scrollTrigger: {
    trigger: topPanel,
    start: "0% 70%",
    end: "100% 0%",
    // markers: false,
    scrub: 1,
  },
});

let typeSplit = new SplitType(".text_split", {
  types: "words, chars, lines",
  tagName: "span",
});

function createScrollTrigger(triggerElement, timeline) {
  ScrollTrigger.create({
    trigger: triggerElement,
    start: "top bottom",
    onLeaveBack: () => {
      timeline.progress(0);
      timeline.pause();
    },
  });

  ScrollTrigger.create({
    trigger: triggerElement,
    start: "top 70%",
    // markers: false,
    onEnter: () => timeline.play(),
  });
}

document.querySelectorAll("[lines]").forEach((element) => {
  let tl = gsap.timeline({ paused: true });
  tl.from(element.querySelectorAll(".line"), {
    opacity: 0,
    yPercent: 100,
    duration: 0.75,
    ease: "power1",
    stagger: { amount: 0.5 },
    // markers: false,
  });
  createScrollTrigger(element, tl);
});

gsap.set(".text-split", { opacity: 1 });

const videos = document.querySelectorAll("video[data-src]");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      video.poster = video.dataset.poster; 
      observer.unobserve(video);
    }
  });
});

videos.forEach((video) => observer.observe(video));
