/*!
 * Restful forms in jQuery v0.0.1
 * http://jquery.com/
 *
 * Copyright Constellation Web Services, LLC
 * http://www.constellationwebservices.com
 * 
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T16:19Z
 */

/**
 * jQuery plugin for restful form handling
 * @param {type} $
 * @returns {undefined}
 */
;(function($){

    function restful(element, opts){

        if(!element.is("form")){
            alert("restful only applies to forms");
        }

        var $this = this;

        this.element = element;

        var defaults = {
            message: "You have unsaved changes.",
            onValidate: function(){return true;},
            onSubmit: function(){},
            onFail: function(){ alert("An error occurred while saving the data."); },
            onReset: function(){},
            toJSON: objectify,
            fromJSON: populate,
            uri: ""
        },
        options = $.extend( {}, defaults, opts ),
        dirty = false;

        this.data = {};

        $(window).on("beforeunload", intercept);

        this.element.change(makeDirty);

        this.element.on("submit", submit);


        function submit(ev){
            var data = options.toJSON($this.element),
            uri = typeof ev === "string" ? 
                        ev :
                        options.uri || $this.element.attr("action");
            if(!!ev && !!ev.preventDefault){
                ev.preventDefault();
            }
            if(options.onValidate.call(this.element, data)){  
                $.post(
                    uri,
                    data
                        )
                        .done(function(ev){
                            makeClean();
                            options.onSubmit(this.element, data);
                        })
                        .fail(function(ev){
                            options.onFail(this.element, data);
                        });
            }
            return false;
        }

        function reset(){
            $this.element[0].reset();
            options.onReset();
        }

        function makeDirty(){
            dirty = true;
        }

        function makeClean(){
            dirty = false;
        }

        /**
         * 
         * @param {jQuery.Event} ev
         * @returns {String|Boolean}
         */
        function intercept(ev){  
            if(!!ev){
                if(dirty){
                    ev.returnValue = options.message;
                    return options.message;
                }else{
                    return;
                }
            }else{
                return dirty;
            }
        }

        function JSON(json){
            return !!json ?
                options.fromJSON(json):
                options.toJSON($this.element);
        }

        /**
         * 
         * @param {Object} json
         * @returns {undefined}
         */
        function populate(json){
            var $elements = $this.element.find(":input:not(.exclude, button, :submit, :reset)"), 
            names = []; //get all unique names of inputs
            $elements.each(function(){
                if(names.indexOf(this.name) === -1){
                    names.push(this.name);
                }
            });
            names.map(function(curr, idx, arr){
                var name = curr.replace("]", "").split("["), tmp = json;
                for(var x = 0; x < name.length; x++){
                    tmp = tmp[name[x]] !== undefined ?
                            tmp[name[x]] :
                            "";
                }
                $elements.filter("[name='" + curr + "']").val(tmp).change();
            });
            makeClean();
        }

        /**
         * accepts an array of input elements or a form converts them to an object suitable for json storage
         * 
         * @param {array|jQuery} frm collection of input elements
         * @param {string} substr to trim off beginning of element names
         * @returns {object}
         */
        function objectify(frm, substr){
            if(frm instanceof jQuery){
                frm = frm.is("form") ?
                        frm.find(":input:not(.exclude, button, :submit, :reset)").get() :
                        frm.get();
            }
            if(!substr) substr = "";
            var thisArg  = { sub: substr}; 
            var map = frm.map(frm_map, thisArg);
            var res = map.reduce(frm_reduce, {});
            var curr;
            for(var nm in res){
                curr = res[nm];
                if(curr.isfinal){
                    var $elements = $(curr.elements);
                    res[nm] = $elements.is(":checkbox, :radio") ?
                            (function(){
                                var arr=[];
                                $elements.filter(":checked").each(function(){
                                    arr.push(this.value);
                                });
                                return arr;
                            })():
                            $elements.val();
                }else{
                    res[nm] = objectify(curr.elements, curr.sub);
                }
            }
            return res;
        }

        /**
         * function for map call in objectify
         * parse element name
         * @param {type} curr current array element to map
         * @param {type} idx index of element
         * @param {type} arr original array
         * @returns {object}
         */
        function frm_map(curr, idx, arr){
            var name = curr.name.substr(this.sub.length), //pull substring off begining of name
                isfinal,
                newsub;
            var names = name.split("["); //create array
            name = names[0].replace("]", ""); //remove trailing square bracket
            if(name === names[0]){ //build new substring to remove on recursive calls
                newsub = this.sub + name; 
            }else{
                newsub = this.sub + names[0];
            }
            isfinal = curr.name.length === newsub.length || curr.name === newsub + "[]"; //we're done don't recurse
            if(!isfinal) newsub +=  "["; // add square bracket back
            return {
                name: name, 
                element: curr,
                sub: newsub,
                isfinal: isfinal
            };
        }

        /**
         * Accumulate mapped elements into JSON object
         * @param {type} prev object returned from previous call
         * @param {type} curr current array element
         * @param {type} idx index of element
         * @param {type} arr array being reduced
         * @returns {object} 
         */
        function frm_reduce(prev, curr, idx, arr){
            if(! prev[curr.name]){
                prev[curr.name] = {elements: [], sub: curr.sub, isfinal: curr.isfinal};
            }
            prev[curr.name].elements.push(curr.element);
            return prev;
        }

        return {
            submit: submit,
            reset: reset,
            JSON: JSON
        }
    }

    /**
     * 
     * @param {Object|String} opts options object to initialize, string to perform action, "submit", "reset", "JSON"
     * @param {Any} val value to pass to requested action, submit -> uri, reset -> none, JSON -> JSON|Object
     * @returns {town_L100.$.fn@call;each}
     */
    $.fn.restful = function(opts, val){
        return this.each(function(){
            var $this = $(this), data = $this.data("restful");
            if(!!data){
                switch(opts){
                    case "submit":
                    case "reset":
                    case "JSON":
                        data[opts](val);
                }
            }else{
                $this.data("restful", new restful($this, opts));
            } 
        });

    };


}(jQuery));
