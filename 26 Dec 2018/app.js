
//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;        
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;        
    };  
    
    var calculateTotal = function(type){
        var sum = 0;        
        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
        });     
        data.totals[type] = sum;   
    };
    
    var data = {
        allItems : {
            exp : [],
            inc : []            
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    return {
        addItem : function(type, des, val){
            var newItem, ID;
            
            // ID = last ID + 1
            // create new id   
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }                     
            

            //create new item based  on "inc" or "exp" type
            if(type === "exp"){
                newItem = new Expense(ID,des, val);
            }else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }      
            
            //pusht it into our data structure
            data.allItems[type].push(newItem);
            /*notes start
            look, this [type] will only be either "inc" or "exp".
            so, here instead of using if else, we have used this
            small trick 
            notes end*/

            // return the new element
            return newItem;
        },

        calcualgeBudget : function(){
            // calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }            
        },

        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },

        testing : function(){
            console.log(data);
        }
    }
})();


// UI CONTROLLER
var UIController = (function(){
    var DOMStrings = {
        inputType : ".add__type",
        inputDescription : ".add__description",
        inputValue : ".add__value",
        inputBtn : ".add__btn",
        incomeContainer : ".income__list",
        expensesContainer : ".expenses__list",
        budgetLabel : ".budget__value",
        incomeLabel : ".budget__income--value",
        expenseLabel : ".budget__expenses--value",
        percentageLabel : ".budget__expenses--percentage",
        container : ".container"
    };
    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMStrings.inputType).value, // Will be wither inc or exp
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }            
        },

        addListItem : function(obj, type){
            var html, newHtml, element;
            // to do
            // create HTML string with placeholder text
            if(type === "inc"){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === "exp"){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }                         

            //replace the placeholder text with some actual data
            newHtml = html.replace("%id%",obj.id);
            newHtml = newHtml.replace("%value%",obj.value);
            newHtml = newHtml.replace("%description%",obj.description);

            // insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields : function(){
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + "," + DOMStrings.inputValue);
            // document.querySelectorAll this returns a list. but we 
            // need an array. that's why, we are casting this list into
            // an array using this below code here
            fieldsArray = Array.prototype.slice.call(fields);
            
            // below here is a very special callBack function
            // it takes three parameters and it automatically
            // detects the fields and values
            // this is cool

            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget : function(obj){
            // this obj is coming from BudgetController via this function getBudget : function()
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;            
            if(obj.percentage >  0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }            
        },

        getDomStrings : function(){
            return DOMStrings;
        }
    }
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){        
        var DOM = UICtrl.getDomStrings();
        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();            
            }
        });
        /* note
        here we will add event listener to the income and
        expense items to delete those elements, but these 
        are generated after clicking
        the add button. so, we will add event to these 
        using there parent object in dom. there method is 
        called event delegation
        */
       document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    };    

    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calcualgeBudget();

        //2. Return the budget 
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        //1. get the filed input data
        input = UICtrl.getInput();        

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();
        }                
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = console.log(event.target.parentNode.parentNode.parentNode.id);
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            //to do
            //1. delete item from the data structure

            //2. delte item from UI

            //3. update and show the new budget
        }
    };
    return {
        init : function(){
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController,UIController);

controller.init();