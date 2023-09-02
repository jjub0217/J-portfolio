

 $(window).scroll(function(){
    curr = $(this).scrollTop()
      html = `현재스크롤값: ${curr}`
    if(curr >= 1){

      $('.onlineEducation-menu').addClass('on')
    }else{
        $('.onlineEducation-menu').removeClass('on')
      }
    }
  )

  $('.header > .inner .nav-item').mousemove(function(e){
    $('.backdrop').addClass('on')
    $('.onlineEducation-menu').removeClass('on')
  })

  $('.header > .inner .nav-item').mouseleave(function(e){
    if($('.onlineEducation-menu').length){
      $('.backdrop').removeClass('on')
      $('.onlineEducation-menu').addClass('on')
    }
  })
  
  $('.header > .backdrop').mousemove(function(e){
    $('.backdrop').addClass('on')
    $('.onlineEducation-menu').removeClass('on')
  })

  $('.header > .backdrop').mouseleave(function(e){
    if($('.onlineEducation-menu').length){
      $('.backdrop').removeClass('on')
      $('.onlineEducation-menu').addClass('on')
    }
  })

  const menuSlide = new Swiper('.onlineEducation-menu .swiper',{
    slidesPerView:"auto",
    spaceBetween: 16,
    cssMode: true,
    breakpoints: {
      851: {
        spaceBetween: 48,
      },
    }
  })
  $('.onlineEducation-menu .swiper-slide').click(function(){
    $(this).addClass('on').siblings().removeClass('on')
  })

  const onlineEducationSlide = new Swiper('.section-onlineEducation .swiper',{
    slidesPerView:3,
    // spaceBetween: 16,
    slideToClickedSlide: false,
    navigation: {
      nextEl: ".section-onlineEducation .next",
      prevEl: ".section-onlineEducation .prev",
    },
    on: {
      activeIndexChange: function(){
        $(".section-onlineEducation .prev").addClass("on")
      }
    },
     breakpoints: {
    // 851 이상에만 적용
      851: {
        spaceBetween: 24,
      },
    }
  })

  $('.section-onlineEducation .tab-item').click(function(e){
    e.preventDefault();
    tabName = $(this).find('a').data('tab');
    $(this).addClass('on').siblings().removeClass('on');
    $(tabName).addClass('on').siblings().removeClass('on');
    const className = tabName.replace("#", ".")
    $(className).addClass('on').siblings().removeClass('on');
  })

  const thisWeekSlide = new Swiper('.section-thisWeek .swiper',{
    slidesPerView: 3,
    spaceBetween: 16,
    loop: true,
    breakpoints: {
      850: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    }
  })

  const lineUpSlide = new Swiper('.section-lineUp .swiper',{
    slidesPerView: 3,
    spaceBetween: 24,
    slideToClickedSlide: false,
    breakpoints: {
      850: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
      navigation: {
      nextEl: ".section-lineUp .next",
      prevEl: ".section-lineUp .prev",
    },
    on: {
      activeIndexChange: function(){
        $(".section-lineUp .prev").addClass("on")
      }
    }
  })

  $(".tooltip").click(function(){
    $(".tip").toggleClass('on')
  })
  const newEducationSlide = new Swiper('.section-newEducation .swiper',{
    slidesPerView: 3,
    spaceBetween: 24,
    loop: true,
    breakpoints: {
      850: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    }
  })  
  $('.related').click(function (e){
    e.preventDefault()
    $(this).toggleClass('on')
  })
  $('.info').click(function (e){
    e.preventDefault()
    $(this).toggleClass('on')
  })

  
  $('.more-btn').click(function(){
    $(this).addClass('active').siblings().addClass('active')
  })

  $(".bookmark").click(function(){
    $(this).addClass("save")
    $(this).siblings(".image-box").addClass("on")
  
  })