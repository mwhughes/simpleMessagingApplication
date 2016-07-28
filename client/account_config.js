Accounts.ui.config({
    requestPermissions: {},
    extraSignupFields: [{
        fieldName: 'username',
        fieldLabel: 'Username',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write your first name");
            return false;
          } else {
            return true;
          }
        }
    },  {
        fieldName: 'avatar',
        showFieldLabel: true,      // If true, fieldLabel will be shown before radio group
        fieldLabel: 'Gender',
        inputType: 'radio',
        radioLayout: 'vertical',    // It can be 'inline' or 'vertical'
        data: [{                    // Array of radio options, all properties are required
    		id: 1,                  // id suffix of the radio element
            label: 'Male',          // label for the radio element
            value: 'ava6.png'              // value of the radio element, this will be saved.
          }, {
            id: 2,
            label: 'Female',
            value: 'ava3.png',
            
        }],
        visible: true
    },  
    {
        fieldName: 'terms',
        fieldLabel: 'I accept the terms and conditions',
        inputType: 'checkbox',
        visible: true,
        saveToProfile: false,
        validate: function(value, errorFunction) {
            if (value) {
                return true;
            } else {
                errorFunction('You must accept the terms and conditions.');
                return false;
            }
        }
    }]
});