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
    markers: false,
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
          markers: false,
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
          markers: false,
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
          markers: false,
          scrub: true,
        },
        y: "0%",
      });
      gsap.to(scaleWork, {
        scrollTrigger: {
          trigger: workBox,
          start: "top 100%",
          end: "bottom 100%",
          markers: FontFaceSetLoadEvent,
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
        markers: false,
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
        markers: false,
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
    markers: false,
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
    markers: false,
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
    markers: false,
  });
  createScrollTrigger(element, tl);
});

gsap.set(".text-split", { opacity: 1 });

//네이버비즈니스 gnb 벗어나는게 왜 범위가 좁을까?
// $('.header > .inner .gnb').hover(function(e){
//   $('.sub-list').addClass('on');
//   $(".header").addClass("hov").height($('.sub-list').outerHeight(true)+$(".header .inner").height())
// },function(e){
//   $('.sub-list').removeClass('on');
//   $(".header").css('height', 'auto')
//   if($('.onlineEducation-menu').length){
//     $(".header").removeClass("hov")
//   }
// })

/**
 *  @모바일버전버거버튼클릭기능
 *
 */
// $(".burgerBtn").click(function(){
//   $('body').toggleClass('scroll-hide');
//   $(".mo_gnb_inner").toggleClass("isAct")
//   $(".search-btn").toggleClass("mo_gnb-on")
//   $(".burgerBtn").toggleClass("on")
//   $(".header").toggleClass("mo_gnb-on")
//   if ($(".burgerBtn").attr('aria-expanded') === 'false') {
//     $('.burgerBtn').attr('aria-expanded', 'true' )
//   } else {
//     $('.burgerBtn').attr('aria-expanded', 'false' )
//   }
// })

// /**
//  *  @모바일버전gnb에서top영역서브리스트나타나는기능
//  *
// */
// $('.mo_gnb_inner .top .nav-item').click(function(e){
//   $(this).find('.sub-list').toggleClass('on');
//   $(this).find(".nav-item_title").toggleClass("on")
// })

// /**
//  *  @모바일버전gnb에서middle영역서브리스트나타나는기능
//  *
// */
// $('.mo_gnb_inner .middle .nav-item').click(function(e){
//   $(this).find('.sub-list').toggleClass('on')
//   $(this).siblings().find('.sub-list').removeClass('on')
//   $(this).find(".nav-item_title").toggleClass("on")
//   $(this).siblings().find(".nav-item_title").removeClass("on")
// })

// /**
//  *  @스크롤탑기능
//  *
// */
// $(".scrollTop").click(function(){
//   $('html, body').animate({scrollTop: 0}, 800);
//   return false;
// })
