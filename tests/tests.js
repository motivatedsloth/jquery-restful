QUnit.test("restful", function( assert ){
    
    var $frm = $("#test"),
    testObj = {
        mytext: "hello world",
        my: {next: "next text"},
        myselect: "tres",
        mycheckbox: ""
    };
    
    $frm.restful({
        onValidate: function(data){
            assert.equal(data.mytext, "test text", "test mytext");
            assert.equal(data.my.next, "text next text", "next level test");
            assert.equal(data.myselect, "dos", "select test");
        }
    });
    
    $frm.submit();
    
    $frm.restful("JSON", testObj);
    
    assert.equal($frm.find(":input[name='mytext']").val(), "hello world", "set test");
    assert.equal($frm.find(":input[name='my[next]']").val(), "next text", "set next test");
    assert.equal($frm.find(":input[name='myselect']").val(), "tres", "set select");
    assert.equal($frm.find(":input[name='mycheckbox']:checked").val(), undefined, "set checked");
});