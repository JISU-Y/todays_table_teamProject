// like 버튼 토글
function toggle_like(food_num, type) {
  // 백엔드로 어떤 음식이 좋아요를 받았는지 보내주어야 하기 때문에
  // food.no 을 전달해준다. type은 빈 하트인지 찬 하트인지(좋아요가 원래 눌려있었는지 아닌지를 판단하기 위함)
  let $a_like = $(`#${food_num} a[aria-label='heart']`);
  let $i_like = $a_like.find("i");
  // 그래서 좋아요를 받은 요리의 하트가 fa-heart (빈하트)이면 좋아요가 안되어 있다는 것
  if ($i_like.hasClass("fa-heart")) {
    $.ajax({
      type: "POST",
      url: "/update_like",
      data: {
        food_num_give: food_num,
        type_give: type,
        action_give: "unlike",
      },
      success: function (response) {
        // 백엔드에서 좋아요 처리한 후 좋아요 개수를 response로 전달해준다.
        // fa-heart(빈 하트)를 지우고 fa-heart-o(찬 하트)로 바꾸어 줌으로써 좋아요 하트를 표시한다.
        // 그러고 a 태그에 count 수 전달
        $i_like.addClass("fa-heart-o").removeClass("fa-heart");
        $a_like.find("span.like-num").text(response["count"]);
      },
    });
  } else {
    // 좋아요가 되어있는 것이면 (찬 하트이면) 이제 unlike 해야함
    $.ajax({
      type: "POST",
      url: "/update_like",
      data: {
        food_num_give: food_num,
        type_give: type,
        action_give: "like",
      },
      success: function (response) {
        // 마찬가지로 찬하트 빼고 빈 하트 추가 바뀐 좋아요 수 적용
        $i_like.addClass("fa-heart").removeClass("fa-heart-o");
        $a_like.find("span.like-num").text(response["count"]);
      },
    });
  }
}

const modalContents = document.querySelector(".modal-contents");
const modalWrap = document.querySelector(".modal-wrap");
const modalResult = document.querySelector(".modal-result");
const controlContainer = document.querySelector(".control-container");
const questionWrap = document.querySelector(".question-wrap");
const questions = document.querySelectorAll(".questions-container");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const submitBtn = document.querySelector(".submit");
const modalHideBtn = document.querySelector(".exit-btn");

// qusetion carousel을 위한 인덱스 선언
let idx = 0;

// modal show/hide
function show_modal() {
  $(".modal").addClass("show");
}

function hide_modal() {
  $(".modal").removeClass("show");
}
// console.log(controlContainer);

// question carousel 이전 / 다음 버튼 담은 컨테이너 클릭 시 동작
controlContainer.addEventListener("click", (e) => {
  // button의 id가 prev 일 경우 idx -1하고 질문 움직임
  if (e.target.id === "prev") {
    idx--;
    moveQuestion(); // 질문 움직임 함수
  } else if (e.target.id === "next") {
    // button의 id가 next 일 경우 idx -1하고 질문 움직임
    idx++;
    moveQuestion();
  }
});

// question carousel 질문 움직임 함수
function moveQuestion() {
  // 일단 가장 처음 질문에서는 이전으로 가면 안되니까 prev btn은 disabled가 default였음
  // 그래서 moveQuestion이 한 번 일어난 순간에는 이전으로 갈 수 있는 상태가 되어야 하니까 disabled false
  prevBtn.disabled = false;

  // question의 개수에 따라 idx 범위 결정
  if (idx === questions.length - 1) {
    // question가 마지막 노드일때 next 버튼에서 submit 버튼으로 바꿈
    console.log("마지막 질문");
    nextBtn.classList.add("hide");
    submitBtn.classList.remove("hide");
    idx = questions.length - 1; // 마지막 노드에선 계속 그 자리 유지
  } else if (idx < 0) {
    // 맨 처음 질문일 때는 idx가 0으로 유지해야함 (음수가 되면 안됨)
    idx = 0;
  } else if (idx === 0) {
    // 대신 0이 되면 다시 이전 버튼 disabled 시켜야함
    prevBtn.disabled = true;
  } else {
    // 나머지 경우 (마지막 질문에서 다시 이전으로 가는 경우)
    // submit 버튼 숨기고 next 버튼 다시 나타나게
    nextBtn.classList.remove("hide");
    submitBtn.classList.add("hide");
  }

  // question 요소를 감싸고 있는 커다란 wrap 컨테이너를 idx에 따라 900px 씩 이동 시킨다
  // translateY는 위아래 중 가운데 위치시키기 위함
  questionWrap.style.transform = `translateX(${-idx * 900}px) translateY(-50%)`;
}

// 설문 clear
function clearQnA() {
  // 질문지를 다시 원상태로 돌려야하므로
  // 이전 버튼 비활성화 / idx 초기화 / question wrap 컨테이너 다시 초기화
  // 이전 / 다음 버튼 정상화
  // 라디오 버튼 디폴트 (맨 위값)으로 설정
  prevBtn.disabled = true;

  idx = 0;
  questionWrap.style.transform = `translateX(0) translateY(-50%)`;
  nextBtn.classList.remove("hide");
  submitBtn.classList.add("hide");

  document.querySelector('input[value="밥"]').checked = true;
  document.querySelector('input[value="저염"]').checked = true;
  document.querySelector('input[value="다이어트식"]').checked = true;
}

// 모달을 끄거나 다시 하기 버튼을 눌렀을 때 동작
function retryQnA() {
  clearQnA(); // 질문지 초기화 시키고

  //result 보여줬던것은 display none으로 질문지는 다시 display로 나타내기
  modalWrap.style.display = "flex";
  modalResult.style.display = "none";
}

// 질문 답변 다 끝나서 제출 눌렀을 때 동작
submitBtn.addEventListener("click", (e) => {
  // 선택되었던 라디오 버튼들의 value들 저장
  const answerType = document.querySelector(
    'input[name="item_type"]:checked'
  ).value;
  const answerHowto = document.querySelector(
    'input[name="item_healthy"]:checked'
  ).value;
  const answerCal = document.querySelector(
    'input[name="item_cal"]:checked'
  ).value;

  // 사실 이거 필요없음
  // 근데 원래 이렇게 배열로 모아서 백엔드로 전달하려고 했으나
  // 배열을 data로 전달하면 Bad Request 400이 뜸
  // 그래서 string 값을 하나씩 전달함
  // 아마 배열은 json 형식으로 변환해서 전달을 해야할 것 같다. (확인 중)
  const answers = [answerType, answerHowto, answerCal];
  console.log(answers);

  // 질문지는 감추고 추천 요리 찾은 결과는 보여주기
  modalWrap.style.display = "none";
  modalResult.style.display = "flex";
  clearQnA();

  // 요리 추천 결과를 담아야하는 컨테이너에서 모든 내용을 다 지우고 다시 temp html을 append하면
  // button은 다시 동작하지 않았기 때문에 버튼은 그대로 두고 앞에 백엔드에서 넘어오는 정보를
  // 나타내주는 부분만 지우기로 했다.
  $(".recomended-dish").find(":not(button)").remove();
  // 메뉴 한 개 추천받으러 ajax call
  $.ajax({
    type: "POST",
    url: "/api/recommend_food",
    data: {
      answers1: answerType,
      answers2: answerHowto,
      answers3: answerCal,
    },
    success: function (response) {
      if (response["result"] == "success") {
        // 카테고리를 넘겨준 것을 토대로 백엔드에서 필터링을 거쳐서 나온 리스트들 중
        // 랜덤으로 한 개만 골라서 recommended라는 데이터를 넘겨주게 된다.
        // 그것을 html로 나타내기
        let recommended_dish = response["recommended"][0];
        let temp_html = `<a href="/detail/${recommended_dish["no"]}" id="result-dish">
                                      <h3 class="dish-name"> ${recommended_dish["menu_name"]}</h3>
                                            <div class="img-wrap">
                                              <img src="${recommended_dish["img"]}" alt="dish-image" />
                                            </div>
                                            <div class="description">
                                              <p class="dish-type">${recommended_dish["menu_type"]}류</p>
                                              <p class="dish-howto">${recommended_dish["menu_howto"]}</p>
                                              <p class="dish-cal">${recommended_dish["calorie"]}kcal</p>
                                              <p class="dish-car">탄: ${recommended_dish["carbo"]}g</p>
                                              <p class="dish-protein">단: ${recommended_dish["protein"]}g</p>
                                              <p class="dish-fat">지: ${recommended_dish["fat"]}g</p>
                                              <p class="dish-natrium">염: ${recommended_dish["natrium"]}mg</p>
                                            </div>
                                          </a>`;
        // append로 붙이게 되면 button은 지우지 않고 계속 있기 때문에
        // button이 위에가고 결과가 밑으로 가게 된다. 그래서 button 앞에 붙이는 prepend 사용
        $(".recomended-dish").prepend(temp_html);
      }
    },
    error: function (e) {
      console.log(e);
      // 추천할 것이 없어서 오류났을 때 (Internal server error 발생)
      let temp_html = `<p class="retry-noti">
                        선택하신 카테고리에 맞는 음식이 없어요ㅠㅠ
                      </p>
                  `;

      $(".recomended-dish").prepend(temp_html);
    },
  });
});

// 다시 추천 받기 버튼과 modal을 끄게 되면 설문을 완전 초기화 시킴
const retryBtn = document.querySelector(".retry-btn");
retryBtn.addEventListener("click", (e) => {
  retryQnA();
});

modalHideBtn.addEventListener("click", (e) => {
  retryQnA();
});

let dishes = "{{ dishes|tojson }}";
$(document).ready(function () {
  $(".search-form").on("submit", function (e) {
    e.preventDefault();
    let words = $(".search-input").val();
    $(".search-input").val("");
    $("#ds").empty();
    let existWords = false;
    for (let i = 0; i < dishes.length; i++) {
      if (dishes[i]["ingredient"].includes(words)) {
        let dish = dishes[i];
        let class_heart = dish["like_by_me"] ? "fa-heart" : "fa-heart-o";

        let dish_no = dishes[i]["no"];
        let dish_img = dishes[i]["img"];
        let dish_name = dishes[i]["menu_name"];
        let dish_type = dishes[i]["menu_type"];
        let temp_html = `<div id = "${dish.no}" class="dish">
                                 <a href="/detail/${dish_no}">
                                 <div class="img-wrap">
                                 <img src="${dish_img}" alt="dish-image"/>
                                 </div>
                                 <div class="description">
                                 <p class="dish-type">${dish_type}</p>
                                 <h3 class="dish-name">${dish_name}</h3>

                                 </div></a>
                                 <a
                                 class="level-item"
                                 aria-label="heart"
                                 onclick="toggle_like('${dish_no}', 'heart')">
                                 <i class= "fa ${class_heart}" aria-hidden="true"></i>
                                  <span class="like-num"> ${dish["count_like"]}</span></a>
                                 </div>`;
        $("#ds").append(temp_html);
        existWords = true;
      }
    }
    if (existWords == false || words == "") {
      alert("다른 재료를 입력해주세요!");
    }
  });
});
