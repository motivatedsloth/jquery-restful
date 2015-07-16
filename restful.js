/*!
 * Restful forms in jQuery v0.0.1
 *
 * Copyright Constellation Web Services, LLC
 * http://www.constellationwebservices.com
 * 
 * Released under the MIT license
 * https://github.com/motivatedsloth/jquery-restful/blob/master/LICENSE
 *
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
            intercept: true,
            onValidate: function(){return true;},
            onSubmit: function(){},
            onFail: function(){ alert("An error occurred while saving the data."); },
            onReset: function(){},
            onDelete: function(){},
            toJSON: objectify,
            fromJSON: populate,
            onLoad: function(){},
            uri: ""
        },
        options = $.extend( {}, defaults, opts ),
        dirty = false;

        this.data = {};
        
        if(options.intercept){
            $(window).on("beforeunload", intercept);

            this.element.change(makeDirty);
        }

        this.element.on("submit", submit);


        function submit(ev){
            var data = options.toJSON($this.element);
            if(!!ev && !!ev.preventDefault){
                ev.preventDefault();
            }
            if(options.onValidate.call(this.element, data)){  
                $.post(
                    getUri(ev),
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
        
        function load(uri){
            $.getJSON(
                uri,
                function(data){
                    options.fromJSON.call($this.element, data);
                    options.onLoad($this.element, data);
                    makeClean();
                });
        }

        function reset(){
            $this.element[0].reset();
            options.onReset();
        }
        
        function remove(ev){
            var data = options.toJSON($this.element);
            if(!!ev && !!ev.preventDefault){
                ev.preventDefault();
            }
             $.ajax(
                    getUri(ev),
            {
                method: "DELETE"
            }
                        )
                        .done(function(ev){
                            makeClean();
                            options.onDelete(this.element, data);
                        })
                        .fail(function(ev){
                            options.onFail(this.element, data);
                        });
        }
        
        function getUri(ev){
            return typeof ev === "string" ? 
                        ev :
                        options.uri || $this.element.attr("action");
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
                typeof json === 'string' ?
                    load(json) :  
                    options.fromJSON.call($this.element, json):
                options.toJSON($this.element);
        }

        /**
         * 
         * @param {Object|String} json data object or uri string to fetch data
         * @returns {undefined}
         */
        function populate(json){
            if(typeof json === 'string'){
                return load(json);
            }
            var $elements = this.find(":input:not(.exclude, button, :submit, :reset)"), 
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
            remove: remove,
            JSON: JSON
        }
    }

    /**
     * 
     * @param {Object|String} opts options object to initialize, string to perform action, "submit", "reset", "remove", "JSON"
     * @param {Any} val value to pass to requested action, submit -> uri, reset -> none, remove -> uri JSON -> JSON|Object
     * @returns {town_L100.$.fn@call;each}
     */
    $.fn.restful = function(opts, val){
        return this.each(function(){
            var $this = $(this), data = $this.data("restful");
            if(!!data){
                switch(opts){
                    case "submit":
                    case "reset":
                    case "remove":
                    case "JSON":
                        data[opts](val);
                }
            }else{
                $this.data("restful", new restful($this, opts));
            } 
        });

    };


}(jQuery));
