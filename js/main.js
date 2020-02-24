var userAgent = navigator.userAgent.toLowerCase();
var Mozila = /firefox/.test(userAgent);
var Chrome = /chrome/.test(userAgent);
var Safari = /safari/.test(userAgent);
var Opera  = /opera/.test(userAgent);
if((/mozilla/.test(userAgent) && !/firefox/.test(userAgent) && !/chrome/.test(userAgent) && !/safari/.test(userAgent) && !/opera/.test(userAgent)) || /msie/.test(userAgent)){
    alert('Ваш браузер застарів. Будь ласка оновіть його версію, або використайте інший.');
}


var CalculatorModal = {
  props: ['checked_row'],
  mounted() {
    document.getElementsByTagName("body")[0].style.overflow = 'hidden';
    let zno = this.getCookie('zno');
    if(zno != undefined){
      this.zno_results = zno.split(',');
      for (var i = 0; i < this.zno_results.length; i++) {
        if(this.zno_results[i].length !== 0){
            this.zno_results[i] = +this.zno_results[i];
        }
      }
    }
    let certificate = this.getCookie('certificate');
    if(certificate != undefined){
      this.certificate_subjects = certificate.split(',');
      for (var i = 0; i < this.certificate_subjects.length; i++) {
         if(this.certificate_subjects[i].length !== 0){
            this.certificate_subjects[i] = +this.certificate_subjects[i];
         }
      }
    }
  },
  created: function () {
      this.debouncedGetSertificateResults =  () => {
        setTimeout(this.getSertificateResults, 400);
      };
      this.debouncedGetResult = () => {
        setTimeout( this.calculate, 400);
      };
      this.debouncedGetZnoResult = () => {
        setTimeout(this.GetZnoResult, 400);
      };
  },
  destroyed() {
      document.getElementsByTagName("body")[0].style.overflow = 'scroll';
  },
  data () {
      return {
          row: this.checked_row,
          regional_coefficient: 1.02,
          subjects: [],
          zno_results: [null,null,null],
          zno_calculate_results: [0,0,0],
          certificate_point: null,
          courses_point: null,
          certificate_subjects: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
          final_zno: 0,
          final_certificate: 0,
          final_courses: 0,
          result: 0,
      }
  },
   watch: {
        certificate_subjects: function (newQuestion, oldQuestion) {
            this.debouncedGetSertificateResults();
        },
        certificate_point: function (newQuestion, oldQuestion) {
            this.debouncedGetResult();
        }, 
        zno_results: function (newQuestion, oldQuestion) {
            this.debouncedGetZnoResult();
        },
    },
  methods: {
      getSertificateResults: function () {
          let certificate_point = 0;
          let certificate_subjects_length = 0;
          let promise = new Promise((resolve, reject) => {
            for (var i = 0; i < this.certificate_subjects.length; i++) {
              if(this.certificate_subjects[i] !== null && typeof(this.certificate_subjects[i]) !== 'string') {
                certificate_point += this.certificate_subjects[i];
                certificate_subjects_length++;
              }
              if(this.zno_results.length - 1 === i){
                resolve();
              }
            }
        });
        promise.then(onFulfilled => {
              if(certificate_point && certificate_subjects_length !== 0){
                  this.certificate_point = +(certificate_point / certificate_subjects_length).toFixed(3);
              }
              this.calculate();
        });
        
      },
      GetZnoResult: function () {
         for (var i = 0; i < this.zno_results.length; i++) {
            if(this.zno_results[i] !== null && typeof(this.zno_results[i]) !== 'string') {
                this.zno_calculate_results[i] = this.zno_results[i] * this.row.merged_columns[i].weight_factor_of_subjects;
                this.zno_calculate_results[i] = +this.zno_calculate_results[i].toFixed(3);
            }
            if(this.zno_results.length - 1 === i){
                this.calculate();
            }
          }
      },
  		calculate: function () {
        this.final_zno = 0;
  			this.zno_calculate_results.forEach(zno_calculate_result => {
            if(zno_calculate_result !== null && typeof(zno_calculate_result) !== 'string') {
                this.final_zno += +zno_calculate_result;
            }
  			});
        if(this.certificate_point !== null && typeof(this.certificate_point) !== 'string') {
            this.final_certificate = +this.row.weight_factor_of_certificate * this.certificate_point;
        }
  			if(this.courses_point !== null && typeof(this.courses_point) !== 'string'){
  				 this.final_courses = +this.row.weight_factor_of_courses * this.courses_point;
  			}
  			this.result = +((this.final_zno + this.final_certificate + this.final_courses) * this.regional_coefficient).toFixed(3);
  		},
      saveChanges: function () {
        this.$root.result[String(this.row.code)] = this.result;
        this.$emit('close-calculator-modal');
        this.setCookie(this.row.code, this.result);
        this.setCookie('zno', this.zno_results);
        this.setCookie('certificate', this.certificate_subjects);
        
      },
  		getCookie: function (name) {
  			let matches = document.cookie.match(new RegExp(
  			    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  			  ));
  			return matches ? decodeURIComponent(matches[1]) : undefined;
  		}, 
  		setCookie: function (code, result) {
  			 document.cookie = code + '=' + result + ';expires=' + (new Date).getTime() + (2 * 365 * 24 * 60 * 60 * 1000);
  		}
  },
  template: `<transition name="modal">
                <div class="modal-mask">
                  <div class="modal-wrapper">
                      <div class="modal-container modal-calculator">
                          <div class="calculator-head">
                              Калькулятор абітурієнта ВНТУ
                          </div>
                          <div class="scroll-calculator">
                            <div class="calculator-body">
                              <div class="zno-subjects-title">
                                  Середній бал атестату:
                              </div>
                              <div class="calculate-the-average-score">
                                  <span>Введіть оцінки зі всіх предметів:</span>
                                  <div class="points">
                                      <input type="text" class="point" maxlength="2" placeholder="бал"
                                             v-for="(certificate_subject, key) in certificate_subjects"
                                             v-model.number="certificate_subjects[key]">
                                  </div>
                                  <div class="calculate-certificate">
                                      <button class="btn btn-certificate" @click="certificate_subjects.push(null)">Додати поле
                                      </button>
                                      <button class="btn btn-certificate" @click="certificate_subjects.pop()">Видалити поле</button>
                                  </div>
                              </div>
                              <div class="result-certificate">
                                   <span>Середній бал :</span>
                                   <input type="text" class="point" maxlength="5" placeholder="бал"
                                          v-model.number="certificate_point"> 
                                    <span style="margin-left:5px;"> = {{+(certificate_point * row.weight_factor_of_certificate).toFixed(2)}}</span>
                              </div>
                                  <div class="zno-subjects-title">
                                      <span>Введіть результати ЗНО:</span>
                                      <span class="small-text">(0-100, бали що надає держава не враховувати)</span>
                                  </div>
                                  <div class="zno-subjects">
                                      <div v-for="(subject, key) in subjects" class="subjects">
                                          <span v-html="subject"></span>
                                          <input type="text" class="point" maxlength="3" placeholder="бал"
                                                 v-model.number="zno_results[key]">
                                      </div>
                                       <div class="header-table">
                                          <div class="column-wrapper column-name-and-code">
                                              <div class="unifying-header">Спеціальності ступеня бакалавра</div>
                                              <div class="row">
                                                  <div>Назва</div>
                                                  <div>Код</div>
                                              </div>
                                          </div>
                                          <div class="merged-row-header">
                                            <div class="column-wrapper column-list-of-competitive-subjects">
                                              <div class="unifying-header">Перелік конкурсних предметів (вступних екзаменів)</div>
                                              <div class="row">
                                                  <div class="subjects-header">для відкритих (бюджетних) конкурсних пропозицій
                                                  (навчання за кошти державного бюджету або за
                                                  контрактом)
                                                  </div>
                                                  <div class="subjects-header">для небюджетних конкурсних пропозицій
                                                  (навчання виключно за контрактом)
                                                  </div>
                                              </div>
                                          </div>
                                          <div class="column-wrapper column-minimum-number-of-points">Мінімальна
                                                                      кількість балів
                                                                      для допуску до
                                                                      участі в
                                                                      конкурсі
                                          </div>
                                          <div class="column-wrapper column-competitive-items">Вагові
                                                                      коефіцієнти
                                                                      (%)
                                                                      конкурсних
                                                                      предметів
                                          </div>
                                           <div class="column-wrapper zno-results-intable">Результати ЗНО
                                          </div>
                                          </div>
                                          <div class="column-wrapper column-certificate">Ваговий
                                                                      коефіцієнт
                                                                      атестату
                                                                      (%)
                                          </div>
                                          <div class="column-wrapper column-preparatory-courses result-curses-column">Середній бал атестату 
                                          </div>
                                          <div class="column-wrapper column-preparatory-courses">Ваговий
                                                                      коефіцієнт
                                                                      за успішне
                                                                      закінчення
                                                                      підготовчих
                                                                      курсів
                                                                      ВНТУ (%)
                                          </div>
                                          <div class="column-wrapper column-preparatory-courses result-curses-column">Результат підготовчих курсів
                                          </div>
                                          <div class="column-wrapper column-result">Результат</div>
                                      </div>
                                      <div class="row-wrapper">
                                          <div class="row column-name-and-code">
                                              <div class="specialty">{{row.specialty}}</div>
                                              <div class="specialty-code">{{row.code}}</div>
                                          </div>
                                          <div class="merged-row-of-items">
                                              <div class="merged-row-of-item" v-for="(merged_column, key) in row.merged_columns">
                                                  <div class="subjects column-list-of-competitive-subjects">
                                                      <div class="subject">{{merged_column.budget_subject}}</div>
                                                      <div class="subject">{{merged_column.non_budgetary_subject}}</div>
                                                  </div>
                                                  <div class="column-minimum-number-of-points column-wrapper">
                                                      {{merged_column.minimum_number_of_points}}
                                                  </div>
                                                  <div class="column-competitive-items column-wrapper">
                                                      {{merged_column.weight_factor_of_subjects}}
                                                  </div>
                                                  <div class="column-wrapper zno-results-intable">
                                                      <div>
                                                          <input type="text" class="point" maxlength="3" placeholder="бал"
                                                                 v-model.number="zno_results[key]">
                                                          <span> = {{zno_calculate_results[key]}}</span>
                                                      </div>
                                                  </div>
                                              </div>
                                              </div>
                                              <div class="column-wrapper column-certificate">
                                                    <div>{{row.weight_factor_of_certificate}}</div>
                                              </div>
                                              <div class="column-wrapper column-preparatory-courses result-curses-column">
                                                  <div>
                                                 <input type="text" class="point" maxlength="5" placeholder="бал"
                                                        v-model.number="certificate_point"> 
                                                  <span style="margin-left:5px;"> = {{+(certificate_point * row.weight_factor_of_certificate).toFixed(2)}}</span>
                                           
                                                  </div>
                                              </div>
                                              <div class="column-wrapper column-preparatory-courses">
                                                    <div>{{row.weight_factor_of_courses}}</div>
                                              </div>
                                               <div class="column-wrapper column-preparatory-courses result-curses-column">
                                                  <div>
                                                  <input type="text" class="point" maxlength="3" placeholder="бал"
                                                                 v-model.number="courses_point">
                                                  <span> = {{final_courses = courses_point * row.weight_factor_of_courses}}</span>
                                                  </div>
                                              </div>
                                              <div class="column-wrapper column-result">
                                                      <div>
                                                           <span class="result-point">{{result}}</span>
                                                      </div>
                                              </div>
                                      </div>
                                  </div>
                                  <div class="zno-subjects-title">
                                      <span>Бал за підготовчі курси ВНТУ:</span>
                                      <span class="small-text">(якщо ви не закінчували підготовчі курси, просто проігноруйте цей пункт)</span>
                                  </div>
                                  <div class="result-certificate">
                                      <span>Бал за підготовчі курси:</span>
                                      <input type="text" class="point" maxlength="3" placeholder="бал" v-model.number="courses_point">
                                  </div>
                                  <div class="result-certificate">
                                      <span style="text-align: center;">Регіональний коефіціент для всіх конкурсних пропозицій - <span style="font-weight: 600;">1.02</span></span>
                                  </div>
                                  <div class="result-certificate">
                                      <span style="font-weight: 600;">Результат розрахунків:</span>
                                      <span  class="result-point">{{result}}</span>
                                  </div>
                                  <div class="next">
                                      <button type="button" class="btn btn-calculate" @click="saveChanges()">Зберегти результати</button>
                                  </div>
                              </div>
                          </div>
                           <div class="close-icon close-modal" @click="$emit('close-calculator-modal')"></div>
                        </div>
                      </div>
                  </div>
              </div>
              </transition>
            `
}

const app = new Vue({
    el: '#app',
    components: {
     'calculator-modal': CalculatorModal,
    },
    data: {
      show_calculator_modal: false,
      show_cookie: false,
      filter_specialty: '',
      checked_row: null,
      result: {},
      table: [
      		{
      			specialty: "Економіка",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Менеджмент",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Фізика або іноземна мова",
      					non_budgetary_subject: "3. Фізика або Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Маркетинг",
      			code: "071",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Підприємництво, торгівля та біржова діяльність",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Економіка",
      			code: "031",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Економіка",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		}
      ],
    },
    created() {
  		this.table.forEach((row) => {
  			let cookie = this.getCookie(row.code);
  			if(cookie !== undefined){
  				this.result[row.code] = cookie;
  			} else {
  				this.result[row.code] = null;
  			}
  		});
  		this.cookieIsSet();
  	},
    computed: {
        filteredTable: function() {
            return this.table.filter(row => {
                return row.specialty.toLowerCase().indexOf(this.filter_specialty.toLowerCase()) !== -1;
            });
        }
    },
    methods: {
    	setValues: function(row) {
    	   this.checked_row = row;
         this.show_calculator_modal = true;
    	},
    	cookieIsSet: function () {
			let result = this.getCookie('coockie');
			result !== 'confirmed' ? this.show_cookie = true : this.show_cookie = false;
  		},
  		getCookie: function (name) {
			let matches = document.cookie.match(new RegExp(
			    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			  ));
			return matches ? decodeURIComponent(matches[1]) : undefined;
  		},
  		confirmUsingCookie: function () {
			document.cookie = 'coockie=confirmed;expires=' + (new Date).getTime() + (2 * 365 * 24 * 60 * 60 * 1000);
			this.show_cookie = false;
  		}
    }
});
