# jquery-restful
Restful form handling with jQuery
Use to make a form RESTful friendly
GET, POST, DELETE methods,
Intercept when leaving page with unsaved data
##Usage
var $myform = $("form")

initialize form

$myform.restful(); 

load data into form, url is required

$myform.restful("JSON", "/some/uri/") 

save data from form, url is optional. The url to POST to is:
1. the provided url
2. the url set in the options
3. the action attribute on the form

$myform.restful("submit", "/some/uri/")

resets the form

$myform.restful("reset") //reset form

delete data on server using the DELETE method. The same url is determined as with POST

$myform.restful("remove", "/some/uri/")

Any fields with an "exclude" class are ignored. However changes to them will still trigger an intercept

##Options

    {
        message: "You have unsaved changes.",
        intercept: true, 
        onValidate: function($elem, data){return true;},
        onSubmit: function($elem, data){}, 
        onFail: function($elem, data){ alert("An error occurred while saving the data."); },
        onReset: function(){},
        onDelete: function($elem, data){},
        toJSON: function($elem){},
        fromJSON: function(data){},
        onLoad: function($elem, data){},
        uri: ""
    }

*intercept* if false user will not get warning if leaving page with unsaved changes

*message* message to display in intercept

*onValidate* function to execute before submitting form. The element is the first argument passed and data to be submitted is the second argument. If function must return true for form to be submitted

*onSubmit* function to execute on successful submission. Can be used to close/hide form refresh other data, etc.

*onFail* function

*onReset* function

*onDelete* function

*toJSON* function must return on object or data string suitable for jQuery.post data argument. 
Default built in function will create a hierarchical object. It filters the form elements as such $elem.find(":input:not(.exclude, button, :submit, :reset)").
Field names are of the sort events[start], events[stop] would create an object like:
    {events: {start: value1, stop: value2}}

*fromJSON* function will receive the data to load into the form. The context of the form is the jQuery form element. ie this.find(":input"). Note the built in
function filters the form elements as such this.find(":input:not(.exclude, button, :submit, :reset)")

*onLoad* function to run after data from server is loaded into form. Can be used to clean up data, or to manipulate the form as needed.

*uri* -optional- the url to use for submit and remove actions. If not provided the form action will be used