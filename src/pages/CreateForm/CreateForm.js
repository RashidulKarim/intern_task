import React, { useEffect, useRef, useState } from 'react';
import './createForm.css';
const CreateForm = () => {
    const [inputFieldData, setInputFieldData] = useState({})
    const [userData, setUserData] = useState({})
    const formRef = useRef()
    const [message, setMessage] = useState({})
    
    useEffect(()=>{
        fetch('http://localhost/api/get_form.php') 
        .then(res => res.json())
        .then(data => {
            setInputFieldData(data?.data?.fields[0])
            })
    }, [])
    
    useEffect(()=>{
        if(!Object.keys(userData).length){
            const obj = {}
        Object.keys(inputFieldData).map(fieldName => 
            obj[fieldName]= inputFieldData[fieldName].value || inputFieldData[fieldName].default
        )
        setUserData(obj)
        
        }
    },[inputFieldData])
    
    const getValue = (e, fieldName, fName, i, status) => {
        const newVal = { ...userData };
        const inputFieldInfo = { ...inputFieldData };
 
        if (status === true) {
            if (newVal.user_hobby?.length > -1) {
                if (newVal.user_hobby?.length >= 1) {
                    newVal[fieldName][i][fName] = e?.target?.value;
                    inputFieldInfo[fieldName].value[i][fName] = e?.target?.value;
                    setInputFieldData(inputFieldInfo);
                    setUserData(newVal);
                    
                } else {
                    newVal[fieldName] = [];
                    newVal[fieldName].push({ [fName]: e?.target?.value });
                    setUserData(newVal);
                    inputFieldInfo[fieldName].value = [];
                    inputFieldInfo[fieldName].value.push({ [fName]: e?.target?.value });
                    setInputFieldData(inputFieldInfo);
                    
                }
            } else {                
                newVal[fieldName] = [];
                newVal[fieldName].push({ [fName]: e?.target?.value });
                setUserData(newVal);
                inputFieldInfo[fieldName].value = [];
                inputFieldInfo[fieldName].value.push({ [fName]: e?.target?.value });
                setInputFieldData(inputFieldInfo);
                
            }
        } else {
            newVal[fieldName] = e?.target?.value;
            setUserData(newVal);
            
        }
    };

    const addRepeater = () => {
        const newVal = { ...inputFieldData };
        if (newVal?.user_hobby?.value === undefined) {
            newVal.user_hobby.value = [];
        }
        if (!newVal?.user_hobby?.value.length) {
            newVal?.user_hobby?.value.push({ work_place: '', designation: '' });
        }
        const obj = { work_place: '', designation: '' };
        newVal?.user_hobby?.value.push(obj);
        setInputFieldData(newVal);

        const userInfo = {...userData};
        if (userInfo?.user_hobby === undefined) {
            userInfo.user_hobby = [];
        }
        if (!userInfo?.user_hobby.length) {
            userInfo?.user_hobby.push({ work_place: '', designation: '' });
        }
        userInfo?.user_hobby.push(obj);
        setUserData(userInfo);
    }
    const deleteRepeater = () =>{
        const newVal = {...inputFieldData}
        const userInfo = {...userData}
        if(newVal?.user_hobby?.value.length === 1){
            return
        }
        userInfo["user_hobby"].pop()    
        newVal?.user_hobby?.value.pop()
        setInputFieldData(newVal)
    }

    const validate = (terms) =>{
        let pattern = "";
        if(terms.includes("|")){
            const requirement = terms.split("|")
            requirement.forEach(term => {
                if(term === "email"){
                    pattern = {type: "email"}
                }
                if(term.includes("max")){
                    pattern = {...pattern, maxLength: term.split(":")[1]}
                }
                if(term.includes("min")){
                    pattern = {...pattern, minLength: term.split(":")[1]}
                }
                if(term === "only_letter_number"){
                    pattern = {...pattern, pattern:"[A-Za-z0-9]+"}
                }
                if(terms === "only_letters"){
                    pattern = {pattern:"[A-Za-z]+"}
                }
                if(terms === "integer"){
                    pattern = {min:"0" ,step:"1", pattern:"[0-9]+"}
                }
            })
            return pattern
        }

        if(terms === "integer"){
            pattern = {min:"0" ,step:"1", pattern:"[0-9]+"}
        }
        if(terms === "only_letters"){
            pattern = {pattern:"[A-Za-z]+"}
        }
        if(terms === "only_letter_number"){
            return {pattern:"[A-Za-z0-9]+"}
        }
        if(terms === "email"){
            pattern = {type: "email"}
        }
        return pattern
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const btn = document.getElementById('submitBtn')
        btn.innerHTML = '<i class="fa fa-refresh fa-spin"></i>'
        btn.setAttribute("disabled", true)  
        fetch("/api/submit_form.php",{
            // because of cors policy only use path here and first part of url use on proxy in package.json
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body: JSON.stringify(userData)
        })
        .then(res => res.json())
        .then(data => {
            setMessage(data)
            formRef.current.reset();
            btn.innerHTML = 'Submit'
            btn.removeAttribute("disabled") 
            const newVal = {...inputFieldData}
            const userInfo = {...userData}
            if(newVal["user_hobby"]){
                newVal.user_hobby["value"]=[] 
                setInputFieldData(newVal)
                userInfo.user_hobby = []
                setUserData(userInfo)
            }
            
        })    
    }
    

    
    return (
        <div className="input-form">
            <h1 className="title">Input Form</h1>
            <div className="main">
                <form ref={formRef} onSubmit={handleSubmit}>
                    {inputFieldData &&
                        Object.keys(inputFieldData).map((fieldName, i) =>
                            inputFieldData[fieldName].type === 'textarea' ? (
                                <div key={i}>
                                    <label className="label" htmlFor="">
                                        {inputFieldData[fieldName].title}:
                                    </label>
                                    <textarea
                                        onChange={(e) => getValue(e, fieldName)}
                                        name={fieldName}
                                        required={inputFieldData[fieldName].required === true}
                                        readOnly={inputFieldData[fieldName].readonly === true}
                                        className="textarea"
                                        {...(inputFieldData[fieldName].value && {
                                            value: inputFieldData[fieldName].value,
                                        })}
                                        {...(inputFieldData[fieldName].html_attr
                                            ? inputFieldData[fieldName].html_attr
                                            : {})}
                                        {...(inputFieldData[fieldName].validate
                                            ? validate(inputFieldData[fieldName].validate)
                                            : {})}
                                    />
                                </div>
                            ) : inputFieldData[fieldName].type === 'select' ? (
                                <div key={i}>
                                    <label className="label" htmlFor="">
                                        {inputFieldData[fieldName].title}:{' '}
                                    </label>
                                    <select
                                        onChange={(e) => getValue(e, fieldName)}
                                        name={fieldName}
                                        required={inputFieldData[fieldName].required === true}
                                        type={inputFieldData[fieldName].type}
                                        {...(userData[fieldName] === undefined
                                            ? { value: inputFieldData[fieldName].default }
                                            : { value: userData[fieldName] })}
                                        {...(inputFieldData[fieldName].html_attr
                                            ? inputFieldData[fieldName].html_attr
                                            : {})}
                                    >
                                        {inputFieldData[fieldName].options.map((option, i) => (
                                            <option
                                                key={i}
                                                value={option.key}
                                                disabled={
                                                    inputFieldData[fieldName].disabled === true
                                                }
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : inputFieldData[fieldName].type === 'radio' ? (
                                <div key={i}>
                                    <label className="label" htmlFor="">
                                        {inputFieldData[fieldName].title}:
                                    </label>
                                    {inputFieldData[fieldName].options.map((option, i) => (
                                        <span key={i}>
                                            <input
                                                disabled={
                                                    inputFieldData[fieldName].disabled === true
                                                }
                                                {...(userData[fieldName] === ''
                                                    ? inputFieldData[fieldName].default ===
                                                      option.key
                                                        ? { checked: true }
                                                        : { checked: false }
                                                    : userData[fieldName] === option.key
                                                    ? { checked: true }
                                                    : { checked: false })}
                                                type="radio"
                                                required={
                                                    inputFieldData[fieldName].required === true
                                                }
                                                name={fieldName}
                                                onChange={(e) => getValue(e, fieldName)}
                                                value={option.key}
                                                {...(inputFieldData[fieldName].html_attr
                                                    ? inputFieldData[fieldName].html_attr
                                                    : {})}
                                            />
                                              <label>{option.label}</label>
                                        </span>
                                    ))}
                                </div>
                            ) : inputFieldData[fieldName].type === 'repeater' ? (
                                <div>
                                    <label className="label">
                                        {inputFieldData[fieldName].title}:
                                    </label>
                                    <span className="add" onClick={addRepeater}>
                                        &#43;
                                    </span>
                                    <span className="remove" onClick={deleteRepeater}>
                                        &#8722;
                                    </span>

                                    {inputFieldData[fieldName].value &&
                                    inputFieldData[fieldName].value.length
                                        ? inputFieldData[fieldName].value.map(
                                              (fieldValue, index) => (
                                                  <div key={index}>
                                                      {Object.keys(
                                                          inputFieldData[fieldName].repeater_fields
                                                      ).map((fName, i) => (
                                                          <div key={i}>
                                                              <label
                                                                  className="labelRepeater"
                                                                  htmlFor=""
                                                              >
                                                                  {
                                                                      inputFieldData[fieldName]
                                                                          .repeater_fields[fName]
                                                                          .title
                                                                  }
                                                                  :{' '}
                                                              </label>
                                                              <input
                                                                  onChange={(e) =>
                                                                      getValue(
                                                                          e,
                                                                          fieldName,
                                                                          fName,
                                                                          index,
                                                                          true
                                                                      )
                                                                  }
                                                                  name={fName}
                                                                  required={
                                                                      inputFieldData[fieldName]
                                                                          .repeater_fields[fName]
                                                                          .required === true
                                                                  }
                                                                  readOnly={
                                                                      inputFieldData[fieldName]
                                                                          .repeater_fields[fName]
                                                                          .readonly === true
                                                                  }
                                                                  type={
                                                                      inputFieldData[fieldName]
                                                                          .repeater_fields[fName]
                                                                          .type
                                                                  }
                                                                  {...(inputFieldData[fieldName]
                                                                      .value && {
                                                                      value: inputFieldData[
                                                                          fieldName
                                                                      ].value[index][fName],
                                                                  })}
                                                                  {...(inputFieldData[fieldName]
                                                                      .html_attr
                                                                      ? inputFieldData[fieldName]
                                                                            .html_attr
                                                                      : {})}
                                                                  {...(inputFieldData[fieldName]
                                                                      .validate
                                                                      ? validate(
                                                                            inputFieldData[
                                                                                fieldName
                                                                            ].validate
                                                                        ) 
                                                                      : {})}
                                                              />
                                                          </div>
                                                      ))}

                                                      <hr />
                                                  </div>
                                              )
                                          )
                                        : Object.keys(
                                              inputFieldData[fieldName].repeater_fields
                                          ).map((fName, i) => (
                                              <div key={i}>
                                                  <label className="labelRepeater" htmlFor="">
                                                      {
                                                          inputFieldData[fieldName].repeater_fields[
                                                              fName
                                                          ].title
                                                      }
                                                      :{' '}
                                                  </label>
                                                  <input
                                                      name={fName}
                                                      required={
                                                          inputFieldData[fieldName].repeater_fields[
                                                              fName
                                                          ].required === true
                                                      }
                                                      readOnly={
                                                          inputFieldData[fieldName].repeater_fields[
                                                              fName
                                                          ].readonly === true
                                                      }
                                                      type={
                                                          inputFieldData[fieldName].repeater_fields[
                                                              fName
                                                          ].type
                                                      }
                                                      onBlur={(e) =>
                                                          getValue(e, fieldName, fName, 0, true)
                                                      }
                                                      {...(inputFieldData[fieldName].html_attr
                                                          ? inputFieldData[fieldName].html_attr
                                                          : {})}
                                                      {...(inputFieldData[fieldName].validate
                                                          ? validate(
                                                                inputFieldData[fieldName].validate
                                                            )
                                                          : {})}
                                                  />
                                              </div>
                                          ))}
                                </div>
                            ) : (
                                inputFieldData[fieldName].type !== 'hidden' && (
                                    <div key={i}>
                                        <label className="label">
                                            {inputFieldData[fieldName].title}:{' '}
                                        </label>
                                        <input
                                            onChange={(e) => getValue(e, fieldName)}
                                            name={fieldName}
                                            required={inputFieldData[fieldName].required === true}
                                            readOnly={inputFieldData[fieldName].readonly === true}
                                            type={inputFieldData[fieldName].type}
                                            {...(inputFieldData[fieldName].value && {
                                                value: inputFieldData[fieldName].value,
                                            })}
                                            {...(inputFieldData[fieldName].html_attr
                                                ? inputFieldData[fieldName].html_attr
                                                : {})}
                                            {...(inputFieldData[fieldName].validate
                                                ? validate(inputFieldData[fieldName].validate)
                                                : {})}
                                        />
                                    </div>
                                )
                            )
                        )}
                    <button id="submitBtn" className="submitBtn" type="submit">
                        Submit
                    </button>
                </form>
            </div>
            {
                Object.keys(message).length> 0 && message["status"] === "success"? <p style={{textAlign:'center', color:'green'}} >{message.messages}</p> : <p style={{textAlign:'center', color:'red'}} >{message.messages}</p>
            }
        </div>
    );
};

export default CreateForm;