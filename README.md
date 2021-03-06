# jquery-restful
Restful form handling with jQuery
Use to make a form RESTful friendly
GET, POST, DELETE methods,
Intercept when leaving page with unsaved data
##Usage

initialize form
    var $myform = $("form")
    $myform.restful(); 

load data into form, url is required

    $myform.restful("JSON", "/some/uri/") 

save data from form, url is optional.

    $myform.restful("submit", "/some/uri/")

or

    $myform.submit()

or, have a submit button on the form. The submit event is watched and canceled.

The url used to POST:
 1. the provided url
 2. the url set in the options
 3. the action attribute on the form


reset the form

    $myform.restful("reset") 

delete data on server using the DELETE method. The same url is determined as with POST

    $myform.restful("remove", "/some/uri/")

Any fields with a ".exclude" class are ignored when loading data or submitting data. However changes to them will still trigger an intercept

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

Built in function will create a hierarchical object. It filters the form elements as such $elem.find(":input:not(.exclude, button, :submit, :reset)").

Field names of the sort events[start], events[stop] would create an object like:

    {events: {start: value1, stop: value2}}

*fromJSON* function will receive the data to load into the form. The context is the jQuery form element. ie this.find(":input"). 

Note the built in function filters the form elements as such this.find(":input:not(.exclude, button, :submit, :reset)") and follows the same hierarchy as *toJSON*

*onLoad* function to run after data from server is loaded into form. Can be used to clean up data, or to manipulate the form as needed. 
This function is *not* called when a data object is provided.

*uri* -optional- the url to use for submit and remove actions. If not provided the form action will be used

*Note:* the onValidate, onSubmit, onFail, onReset, onDelete functions are all called in the context of the restful object. This exposes this.dirty and this.element. To prevent the page intercept set this.dirty to false.