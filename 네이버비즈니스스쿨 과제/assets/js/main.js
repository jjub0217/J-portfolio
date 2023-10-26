
/** 
 *  @이게뭐더라
 * 
*/
// $(window).trigger('click')


/** 
 *  @floating메뉴내부의swiper기능
 * 
*/
const menuSlide = new Swiper('.floating-menu .swiper',{
  slidesPerView:"auto",
  spaceBetween: 16,
  cssMode: true,
  breakpoints: {
    851: {
      spaceBetween: 48,
    },
  }
})

/** 
 *  @스크롤위치에따른floating메뉴나타내기
 * 
*/
$(window).scroll(function(){
  curr = $(this).scrollTop()
    html = `현재스크롤값: ${curr}`
  if(curr >= 1){
    $('.floating-menu').addClass('on')
  }else{
    $('.floating-menu').removeClass('on')
    }
  }
)

/** 
 *  @floating메뉴내부의슬라이드클릭기능
 * 
*/
$('.floating-menu .swiper-slide').click(function(){
  $(this).addClass('on').siblings().removeClass('on')
})



/** 
 *  @윈도우가로드되면json데이터fetch해오는함수들실행
 * 
*/
$(window).on("load",function(){
  onlineEducationList()
  thisWeekList()
  lineUpList()
  newEducationList()
  noticeList()
})



/** 
 * @onlineEducation섹션
 * 
*/
/** 
 * @onlineEducation섹션내부의swiper기능
 * 
*/
const onlineEducationSlide = new Swiper('.section-onlineEducation .swiper',{
  slidesPerView:3,
  spaceBetween: 16,
  clickable: false,
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
/** 
 *  @onlineEducation섹션내용불러오는fetch함수
 * 
*/
function onlineEducationList(tab) {
  fetch('./data.json')
  .then(res => res.json())
  .then(json => {
    data = json.onlineEducation

    let html1 = ``
    let html1_2 = 
    `<li class="swiper-slide link-more">
      <a href=""></a>
      <div class="slide">
        <p>
          <span>네이버 AI</span> 코스 교육<br>
          10개 전체보기
        </p>
      </div>
    </li>`
    let html2 = ``
    let html2_2 = 
    `<li class="swiper-slide link-more">
      <a href=""></a>
      <div class="slide">
        <p><span>스마트스토어</span> 코스 교육<br>79개 전체보기</p>
      </div>
    </li>`
    let html3 = ``
    let html3_2 = 
    `<li class="swiper-slide link-more">
        <a href=""></a>
        <div class="slide">
          <p><span>쇼핑라이브</span> 코스 교육<br>37개 전체보기</p>
        </div>
      </li>`
    let html4 = ``
    let html4_2 = 
    `<li class="swiper-slide link-more">
      <a href=""></a>
      <div class="slide">
        <p><span>스마트플레이스</span> 코스 교육<br>36개 전체보기</p>
      </div>
    </li>`
    let html5 = ``
    let html5_2 = 
    `<li class="swiper-slide link-more">
      <a href=""></a>
      <div class="slide">
        <p><span>스마트스토어</span> 코스 교육<br>79개 전체보기</p>
      </div>
    </li>`
    let html6 = ``
    let html6_2 = 
    `<li class="swiper-slide link-more">
      <a href=""></a>
      <p><span>블로그/인플루언서</span> 코스 교육<br>31개 전체보기</p>
    </li>`
    let html7 = ``
    let html7_2 = 
    `<li class="swiper-slide link-more">
      <a href=""></a>
      <div class="slide">
        <p><span>엑스퍼트/프리미엄콘텐츠</span> 코스 교육<br>20개 전체보기</p>
      </div>
    </li>`
    let html8 = ``
    let html8_2 = 
    `<li class="swiper-slide link-more">
      <div class="slide">
        <a href="" class="link-slide"></a>
        <p><span>비즈니스팁</span> 코스 교육<br>37개 전체보기</p>
      </div>
    </li>`

    // sortData = data.filter(item => {
    //   return item.skin.indexOf(tab) >= 0
    // })
    data.forEach(education => {
      data1 = education.online1
      data2 = education.online2
      data3 = education.online3
      data4 = education.online4
      data5 = education.online5
      data6 = education.online6
      data7 = education.online7
      data8 = education.online8
          data1.forEach(element => {
      html1+=
      `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html1 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html1 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html1 += 
                  `<span>${text}</span>`
                  })
                  html1 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data2.forEach(element => {
      html2+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html2 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html2 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html2 += 
                  `<span>${text}</span>`
                  })
                  html2 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data3.forEach(element => {
      html3+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html3 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html3 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html3 += 
                  `<span>${text}</span>`
                  })
                  html3 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data4.forEach(element => {
      html4+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html4 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html4 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html4 += 
                  `<span>${text}</span>`
                  })
                  html4 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data5.forEach(element => {
      html5+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html5 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html5 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html5 += 
                  `<span>${text}</span>`
                  })
                  html5 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data6.forEach(element => {
      html6+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html6 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html6 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html6 += 
                  `<span>${text}</span>`
                  })
                  html6 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data7.forEach(element => {
      html7+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html7 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html7 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html7 += 
                  `<span>${text}</span>`
                  })
                  html7 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    data8.forEach(element => {
      html8+=
        `<li class="swiper-slide"> 
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
              <div class="bottom">
                <ul class="tag-list">`
                  element.tags.forEach(tag => {
                  html8 += 
                  `<li class="tag">${tag}</li>`
                  })
                  html8 += 
                `</ul>
                <p class="desc">
                  ${element.desc}
                </p>
                <p class="short-desc">`
                  element.shortDesc.forEach(text => {
                  html8 += 
                  `<span>${text}</span>`
                  })
                  html8 +=
                `</p>
              </div>
            </div>
          </div>
        </li>`
    })
    })

    $(".section-onlineEducation #online1 .swiper-wrapper").html(html1+html1_2);
    $(".section-onlineEducation #online2 .swiper-wrapper").html(html2+html2_2);
    $(".section-onlineEducation #online3 .swiper-wrapper").html(html3+html3_2);
    $(".section-onlineEducation #online4 .swiper-wrapper").html(html4+html4_2);
    $(".section-onlineEducation #online5 .swiper-wrapper").html(html5+html5_2);
    $(".section-onlineEducation #online6 .swiper-wrapper").html(html6+html6_2);
    $(".section-onlineEducation #online7 .swiper-wrapper").html(html7+html7_2);
    $(".section-onlineEducation #online8 .swiper-wrapper").html(html8+html8_2);
  })
}
/** 
 *  @onlineEducation섹션내부의북마크기능
 * 
*/
$(document).on("click", ".bookmark",(function(){
  $(this).toggleClass("save")
  $(this).siblings(".image-box").addClass("on")
}))
/** 
 *  @onlineEducation섹션탭이동
 * 
*/
$('.section-onlineEducation .tab-item').click(function(e){
  e.preventDefault();
  tabName = $(this).find('a').data('tab');
  $(this).addClass('on').siblings().removeClass('on');
  $(tabName).addClass('on').siblings().removeClass('on');
  const className = tabName.replace("#", ".")
  $(className).addClass('on').siblings().removeClass('on');
})



/** 
 *  @thisWeek섹션
 * 
*/
/** 
 *  @thisWeek섹션내부의PC버전swiper기능
 * 
*/
const thisWeekSlidePc = new Swiper('.section-thisWeek .swiper.pc',{
    slidesPerView: 4,
    spaceBetween: 24,
})
/** 
 *  @thisWeek섹션내부의모바일버전swiper기능
 * 
*/
const thisWeekSlideMo = new Swiper('.section-thisWeek .swiper.mo',{
  slidesPerView: 'auto',
  centeredSlides: true,
  loop: true,
  spaceBetween: 16,
  initialSlide: 0,
  clickable: false,
  on: {
    transitionEnd: function(){
      anchor(this)
    }
  },
})
/** 
 *  @thisWeek섹션내부고정텍스트이동기능
 * 
*/
function anchor(swipe) {
  const centerIndex = swipe.realIndex
  const section = swipe.el.parentNode.parentNode.className
  switch(centerIndex){
    case 0:
      $(`.${section} .text-box-mo#${section}-1`).addClass("on").siblings().removeClass("on")
      break;
    case 1:
      $(`.${section} .text-box-mo#${section}-2`).toggleClass("on").siblings().removeClass("on")
      break;
    case 2:
      $(`.${section} .text-box-mo#${section}-3`).toggleClass("on").siblings().removeClass("on")
      break;
    case 3:
      $(`.${section} .text-box-mo#${section}-4`).toggleClass("on").siblings().removeClass("on")
      break;
    default:
    return
  }
}
/** 
 *  @thisWeek섹션내용불러오는fetch함수(모바일버전fetch못함)
 * 
*/
function thisWeekList() {
  fetch('./data.json')
  .then(res => res.json())
  .then(json => {
    data = json.thisWeek

    let htmlPc = ``
    data.forEach(element => {
      console.log(element);
      htmlPc += 
      `<li class="swiper-slide">
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
              <p class="save-text">
                나중에 볼 교육으로 저장 되었습니다.
              </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}
            </strong>
            <div class="bottom">
              <ul class="tag-list">`
                element.tags.forEach(tag => {
                htmlPc += 
                `<li class="tag">${tag}
                </li>`
                })
                htmlPc += 
              `</ul>
              <p class="desc">
              ${element.desc}
              </p>
              <p class="short-desc">`
                element.shortDesc.forEach(text => {
                  htmlPc += 
                  `<span>${text}</span>`
                })
                htmlPc +=
              `</p>
            </div>
          </div>
          <button class="bookmark" aria-label="북마크"></button>
        </div>
      </li>`
    })
    // data.forEach(element => {
    //   console.log(element);
    //   htmlMo +=   
    //   `<li class="swiper-slide">
    //     <a href="" class="link-slide">
    //     </a>
    //     <div class="image-box">
    //       <img src=${element.imageUrl} alt="">
    //       <p class="save-text">
    //         나중에 볼 교육으로 저장 되었습니다.
    //       </p>
    //     </div>
    //     <button class="bookmark" aria-label="북마크"></button>
    //   </li>`
    // })
    $(".section-thisWeek .pc .swiper-wrapper").html(htmlPc);
    // $(".section-thisWeek .mo .swiper-wrapper").html(htmlMo);
  })
}



/** 
 *  @lineUp섹션
 * 
*/
/** 
 *  @lineUp섹션내부의swiper기능
 * 
*/
const lineUpSlide = new Swiper('.section-lineUp .swiper',{
  slidesPerView: 3,
  spaceBetween: 16,
  clickable: false,
  breakpoints: {
    851: {
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
/** 
 *  @lineUp섹션내용불러오는fetch함수
 * 
*/
function lineUpList() {
  fetch('./data.json')
  .then(res => res.json())
  .then(json => {
    data = json.lineUp

    let html = ``
    data.forEach(element => {
      console.log(element);
      html += 
      `<li class="swiper-slide">
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
            <p class="save-text">
              나중에 볼 교육으로 저장 되었습니다.
            </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}</strong>
            <p class="short-desc">`
              element.shortDesc.forEach(text => {
                html += 
                `<span>${text}</span>`
              })
              html +=
            `</p>
            <button class="more-btn">더보기</button>
            <div class="more-area">`
              element.paragraph.forEach(content => {
                html +=
                `<div class="paragraph">
                  <p class="more-title">${content.title}</p>
                  <p class="more-content">
                  ${content.moreContent}
                  </p>
                </div>`
              })
              html +=
            `</div>
          </div>
          <button class="bookmark" aria-label="북마크"></button>
        </div>
      </li>`
    })
    $(".section-lineUp .swiper-wrapper").html(html);
  })
}
/** 
 *  @lineUp섹션내부더보기기능
 * 
*/
$(document).on("click",".more-btn",(function(){
  console.log('eee');
  $(this).addClass('active').siblings().addClass('active')
}))
/** 
 *  @lineUp섹션내부툴팁기능
 * 
*/
$(".tooltip").click(function(){
  $(".tip").toggleClass('on')
})



/** 
 *  @newEducation섹션
 * 
*/
/** 
 *  @newEducation섹션내부의PC버전swiper기능
 * 
*/
const newEducationSlidePc = new Swiper('.section-newEducation .swiper.pc',{
  slidesPerView: 4,
  spaceBetween: 24,
  clickable: false,
}) 
/** 
 *  @newEducation섹션내부의모바일버전swiper기능
 * 
*/
const newEducationSlideMo = new Swiper('.section-newEducation .swiper.mo',{
  slidesPerView: 'auto',
  centeredSlides: true,
  loop: true,
  spaceBetween: 16,
  initialSlide: 0,
  clickable: false,
  on:   {
    transitionEnd: function(){
      anchor(this)
    }
  } 
})  
/** 
 *  @newEducation섹션내용불러오는fetch함(모바일버전fetch못함)
 * 
*/
function newEducationList() {
  fetch('./data.json')
  .then(res => res.json())
  .then(json => {
    data = json.newEducation

    let htmlPc = ``
    data.forEach(element => {
      console.log(element);
      htmlPc += 
      `<li class="swiper-slide">
        <a href="" class="link-slide">
          <span class="blind">링크</span>
        </a>
        <div class="slide">
          <div class="image-box">
            <img src=${element.imageUrl} alt="">
              <p class="save-text">
                나중에 볼 교육으로 저장 되었습니다.
              </p>
          </div>
          <div class="text-box">
            <strong>${element.textStrong}
            </strong>
            <div class="bottom">
              <ul class="tag-list">`
                element.tags.forEach(tag => {
                htmlPc += 
                `<li class="tag">${tag}
                </li>`
                })
                htmlPc += 
              `</ul>
              <p class="desc">
              ${element.desc}
              </p>
              <p class="short-desc">`
                element.shortDesc.forEach(text => {
                  htmlPc += 
                  `<span>${text}</span>`
                })
                htmlPc +=
              `</p>
            </div>
          </div>
          <button class="bookmark" aria-label="북마크"></button>
        </div>
      </li>`
    })
    // data.forEach(element => {
    //   console.log(element);
    //   htmlMo +=   
    //   `<li class="swiper-slide">
    //     <a href="" class="link-slide">
    //     </a>
    //     <div class="image-box">
    //       <img src=${element.imageUrl} alt="">
    //       <p class="save-text">
    //         나중에 볼 교육으로 저장 되었습니다.
    //       </p>
    //     </div>
    //     <button class="bookmark" aria-label="북마크"></button>
    //   </li>`
    // })
    $(".section-newEducation .pc .swiper-wrapper").html(htmlPc);
    // $(".section-thisWeek .mo .swiper-wrapper").html(htmlMo);
  })
}



/** 
 *  @notice섹션내용불러오는fetch함수
 * 
*/
function noticeList() {
  fetch('./data.json')
  .then(res => res.json())
  .then(json => {
    data = json.notice

    let html = ``
    data.forEach(element => {
      console.log(element);
      html += 
      `<li class="notice-item">
          <a href="">
            <ul class="tag-list">`
              element.tags.forEach(tag => {
                html += 
                `<li class="tag">${tag}
                </li>`
                })
               html +=
              `</ul>
            <strong>${element.textStrong}</strong>
            <p class="date">${element.date}</p>
          </a>
        </li>`
    })
    $(".section-notice .notice-list").html(html);
  })
}



/** 
 *  @pc버전gnb서브리스트나타내는hover기능-
 * 
*/
//네이버비즈니스 gnb 벗어나는게 왜 범위가 좁을까?
$('.header > .inner .gnb').hover(function(e){
  $('.sub-list').addClass('on');
  $(".header").addClass("hov").height($('.sub-list').outerHeight(true)+$(".header .inner").height())
},function(e){
  $('.sub-list').removeClass('on');
  $(".header").css('height', 'auto')
  if($('.onlineEducation-menu').length){
    $(".header").removeClass("hov")
  }
})


/** 
 *  @pc버전돋보기버튼클릭기능
 * 
*/
$(".search-btn").click(function(){
  $('.header').addClass("search")
  $(".search-area input").focus()
})


/** 
 *  @pc버전돋보기버튼닫기기능
 * 
*/
$(".close-btn").click(function(){
  $('.header').removeClass("search")
})


/** 
 *  @모바일버전버거버튼클릭기능
 * 
*/
$(".burgerBtn").click(function(){
  $('body').toggleClass('scroll-hide');
  $(".mo_gnb_inner").toggleClass("isAct")
  $(".search-btn").toggleClass("mo_gnb-on")
  $(".burgerBtn").toggleClass("on")
  $(".header").toggleClass("mo_gnb-on")
  if ($(".burgerBtn").attr('aria-expanded') === 'false') {
    $('.burgerBtn').attr('aria-expanded', 'true' )
  } else {
    $('.burgerBtn').attr('aria-expanded', 'false' )
  }
})


/** 
 *  @모바일버전gnb에서top영역서브리스트나타나는기능
 * 
*/
$('.mo_gnb_inner .top .nav-item').click(function(e){
  $(this).find('.sub-list').toggleClass('on');
  $(this).find(".nav-item_title").toggleClass("on")
})


/** 
 *  @모바일버전gnb에서middle영역서브리스트나타나는기능
 * 
*/
$('.mo_gnb_inner .middle .nav-item').click(function(e){
  $(this).find('.sub-list').toggleClass('on')
  $(this).siblings().find('.sub-list').removeClass('on')
  $(this).find(".nav-item_title").toggleClass("on")
  $(this).siblings().find(".nav-item_title").removeClass("on")
})


/** 
 *  @관련사이트클릭기능
 * 
*/
$('.related').click(function (e){
  e.preventDefault()
  $(this).toggleClass('on')
})


/** 
 *  @footer의info영역클릭해서나타내는기능
 * 
*/
$('.info').click(function (e){
  e.preventDefault()
  $(this).toggleClass('on')
})

/** 
 *  @스크롤탑기능
 * 
*/
$(".scrollTop").click(function(){
  $('html, body').animate({scrollTop: 0}, 800);
  return false;
})