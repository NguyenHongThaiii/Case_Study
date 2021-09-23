
function Validator(formsSelector) {
    function getParent(element,selector) {
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var formElement = document.querySelector(formsSelector);

    var ruleSelector = {}
    var validatorRules = {
        required: function(value) { 
            if(typeof value === 'string'){
                return value.trim() ? undefined : 'Vui lòng nhập đầy đủ thông tin'
            }
            return value ? undefined : 'Vui lòng nhập đầy đủ thông tin'

        },
        email: function(value) { 
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : "Trường này phải nhập Email"
        },
        min: function(min) { 
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
            }
        },
        password_confirmation: function(value){
            return value === formElement.querySelector('#password').value ? undefined: 'Mật khẩu nhập lại không chính xác'
        }
    }

    if(formElement){
        var inputs = document.querySelectorAll('[name][rules]')
        if(inputs){
            for(var input of inputs){
                var rules = input.getAttribute('rules').split('|')
                for(var rule of rules){
                    var ruleInfor
                    var ruleHasValue = rule.includes(':')
                    if(ruleHasValue){
                        ruleInfor = rule.split(':')
                         rule = ruleInfor[0]
                    }
                    var ruleFunc = validatorRules[rule]

                    if(ruleHasValue){
                        ruleFunc = ruleFunc(ruleInfor[1])
                    }
                    if(Array.isArray(ruleSelector[input.name])){
                        ruleSelector[input.name].push(ruleFunc)
                    }
                    else{
                        ruleSelector[input.name] = [ruleFunc]
                    }
                }        
                // handel Event
                input.onblur = handelValidate
                input.oninput = handelClear
            }
        }
        function handelValidate(e){
            var rules = ruleSelector[e.target.name]
            var errorMessage
            for(var rule of rules){
                switch(e.target.type){
                    case 'radio':
                    case 'checkbox':
                    errorMessage = rule(
                        formElement.querySelector('input[name="'+input.name+'"]:checked')                    )
                    break
                    default:
                        errorMessage = rule(e.target.value)
                }
                if(errorMessage) break;
            }
            var formGroup = getParent(e.target,'.form-group')
            var errorElement = formGroup.querySelector('.form-message')
            if(errorMessage){
                formGroup.classList.add('invalid')
                errorElement.innerHTML = errorMessage
            }
            else{
                formGroup.classList.remove('invalid')
                errorElement.innerHTML =''
            }
            return !errorMessage
        }
        function handelClear(e){
            var formGroup = getParent(e.target,'.form-group')
            var errorElement = formGroup.querySelector('.form-message')
            formGroup.classList.remove('invalid')
            errorElement.innerHTML = ''
        }
        formElement.onsubmit = (e)=>{
            e.preventDefault()
            var isValid = true
            for(var input of inputs){
                // e = {target:input}
                // e đại diện cho thẻ được chọn
                if(!handelValidate({target:input})){
                    isValid = false
                }
            }
            if(isValid){
                if(typeof this.onSubmit ==='function'){
                    var valueInpust = Array.from(inputs).reduce((value,input)=>{
                        switch(input.type){
                            case 'radio':
                                if(input.checked){
                                value[input.name] = input.value 
                                }
                            break
                            case 'checkbox':
                                if(input.matches(':checked')){
                                    if(Array.isArray(value[input.name])){
                                        value[input.name].push(input.value)
                                    }
                                    else{
                                        value[input.name] = [input.value]
                                    }
                                }
                            break
                            // case 'file':
                            //     value[input.name] = input.files 
                            // break
                            default:
                                value[input.name] = input.value 
                        }
                        return value               
                    },{})
                    this.onSubmit(valueInpust)
                }
                else{
                    formElement.submit()
                }
            }

        }
    }
}