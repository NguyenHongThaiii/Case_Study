
function Validator(formSelector) {
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var formRules = {}
    var validatorRules = {
        required: function(value){
            return value ? undefined : `Vui lòng nhập trương này`
        },
        email: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Trường này phải nhập Email'
        },
        min: function(min){
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    },
}
    var formElement = document.querySelector(formSelector);

    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]')
        if(inputs){
            for(var input of inputs){
                var rules = input.getAttribute('rules').split('|') 

                for(var rule of rules){
                    var ruleHasValue = rule.includes(':')

                    if(ruleHasValue){
                        var ruleInfor = rule.split(':')
                        rule = ruleInfor[0]
                    }
                    var ruleFunc = validatorRules[rule]
                    
                    if(ruleHasValue){
                        ruleFunc = ruleFunc(ruleInfor[1])
                    }
                    if(Array.isArray(formRules[input.name])){
                        formRules[input.name].push(ruleFunc)
                    }
                    else{
                        formRules[input.name] = [ruleFunc]
                    }
                }
                
                // lắng nghe event
                input.onblur = handelValidate
                input.oninput = handelClear
            }
            function handelValidate(e){
                var rules = formRules[e.target.name]
                var errorMessage
                 for(var rule of rules){
                     errorMessage = rule(e.target.value)
                     if(errorMessage) break
                 }
                 var formGroup = getParent(e.target,'.form-group')
                 if(formGroup){
                     var formMessage = formGroup.querySelector('.form-message')
                     if(formMessage){
                         if(errorMessage){
                             formMessage.innerText = errorMessage
                             formGroup.classList.add('invalid')
                         }
                         else{
                             formMessage.innerText = ''
                             formGroup.classList.remove('invalid')
                         }
                     }
                 }
                 return !errorMessage
            }
            function handelClear(e){
                var formGroup = getParent(e.target,'.form-group')
                var formMessage = formGroup.querySelector('.form-message')
                if(formGroup.matches('.invalid')){
                    formGroup.classList.remove('invalid')
                    if(formMessage){
                        formMessage.innerText = ''
                    }
                }
            }
        }
        formElement.onsubmit = (e) =>{
            e.preventDefault()
            var isValid = true
            for(var input of inputs){
                if(!handelValidate({target:input})){
                    isValid = false
                }
                 
            }
            if(isValid){             
                if(typeof this.onSubmit === 'function'){
                    var valueInputs = Array.from(inputs).reduce(function(values,input){
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formEmlement.querySelector('input[name="'+input.name+'"]:checked').value
                                break;
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                    if (!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                } 
                                else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break; 
                            case 'file':
                                values[input.name] = input.files
                                break;                   
                            default:
                                    values[input.name] = input.value
                        }
                        return values
                    },{})
                    this.onSubmit(valueInputs)
                }
                else{
                    formElement.submit()
                }
            }
        }
    }
}