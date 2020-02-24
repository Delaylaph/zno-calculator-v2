# zno calculator v2

## Table

All table rows are in an array 'table'. A row is an object of type:
```javascript
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
```
You can change the regional coefficient in main.js:
```javascript
data () {
      return {
        regional_coefficient: 1.02,
      }
}
```
You can retrieve the table from your server as needed. It should be in json format. For example:
```javascript
const axios = require('axios');

axios.get('/get-rows')
   .then((response) => {
        this.table = JSON.parse(response.data);
    }).catch((error) => {
        console.log(error.response.data);
    });
```
