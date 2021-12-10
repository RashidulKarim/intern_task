import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import './list.css';
const List = () => {
    const [listData, setListData] = useState({})
    const [rowData, setRowData] = useState([])
    const [query, setQuery] = useState('')
    const [searchingField, setSearchingFiled] = useState("")
    const [order, setOrder] = useState("ASC")
    const [message, setMessage] = useState({})
    
    useEffect(()=>{
        fetch("http://localhost/api/list.php")
        .then(res => res.json())
        .then(data => {
            setListData(data.data)
            setRowData(data?.data?.rows)
        })
    },[])
    
    
    const handleSort = (field) => {
        if(order === "ASC"){
            const sorted = [...rowData].sort((a,b) => (a[field] || " ").toString().toLowerCase() > (b[field] || " ").toString().toLowerCase() ? 1 : -1)
            setRowData(sorted)
            setOrder("DSC")
        }

        if(order === "DSC"){
            const sorted = [...rowData].sort((a,b) => (a[field] || " ").toString().toLowerCase() < (b[field] || " ").toString().toLowerCase() ? 1 : -1)
            setRowData(sorted)
            setOrder("ASC")
        }
    }
    

    const search = (rows) => {
        return rows.filter(row => (row[searchingField] || " ").toString().toLowerCase().indexOf(query.toLocaleLowerCase())> -1)
    }

    const handleDragEnd = (results) => { 
        if(!results.destination) return     
        let tempUser = [...rowData]
        let [selectRow] = tempUser.splice(results.source.index, 1)
        tempUser.splice(results.destination.index, 0, selectRow )        
        setRowData(tempUser)
        if(results.source["index"] !== results.destination["index"]){
            fetch("/api/reorder.php", { 
                // because of cors policy only use path here and first part of url use on proxy in package.json
                method:"POST",
                headers:{
                    "content-type":"application/json"
                },
                body: JSON.stringify(tempUser)
            })
            .then(res => res.json())
            .then(data => setMessage(data))
        }
    }

    useEffect(()=>{
        
        if(listData?.headers?.[0]){
            const fieldName = listData?.headers && Object.keys(listData?.headers?.[0]).find(name => listData?.headers?.[0][name].searchable === true)
            setSearchingFiled(fieldName)
        }
    },[listData?.headers])
    
    
    return (
        <div>
            <h1 style={{textAlign:'center'}}>List of Data</h1>
            <div className="table">
            <input 
            type="text" 
            value={query} 
            onChange={(e)=>setQuery(e.target.value)} 
            placeholder="search"/>
            <label style={{marginLeft:'20px'}}>
                Search By:
            </label>
                <select 
                onChange={(e)=>setSearchingFiled(e.target.value)}>
                    {
                        listData?.headers?.[0] && 
                        Object.keys(listData?.headers?.[0]).map((th, i) =>listData?.headers?.[0][th].searchable === true && <option key={i} value={th}>{listData?.headers?.[0][th].title}</option>)
                    }
                </select>
            <DragDropContext 
            onDragEnd={(results) => handleDragEnd(results)}>
                <table>
                    <thead>
                        <tr>
                        {
                            listData?.headers?.[0] && 
                            Object.keys(listData?.headers?.[0]).map((th, i) =>listData?.headers?.[0][th].hidden === false && <th className="column" key={i}>{listData?.headers?.[0][th].title}{listData?.headers?.[0][th].sortable === true && <button onClick={()=>handleSort(th)} style={{marginLeft:'10px'}}>sort</button>}</th>
                            )
                        }
                        </tr>
                    </thead>
                    <Droppable droppableId='tbody'>
                    {
                        (provided)=>(
                        <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {
                            rowData && search(rowData).map((data,i)=> 
                            <Draggable key={data.name} draggableId={data.name} index={i}>
                            {
                                (provided) => (
                                    <tr key={i}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    
                                    >
                                    {Object.keys(listData?.headers?.[0]).map((fieldName, i) =>listData?.headers?.[0][fieldName].hidden === false &&  
                                    <td key={i} 
                                    {...provided.dragHandleProps}><Link className='link' to='/updateForm'>{data[fieldName]}</Link> </td>)}
                                </tr>
                                )
                            }
                            </Draggable>
                            
                            )      
                            }
                            {provided.placeholder}
                        </tbody>
                        ) 
                    }
                    </Droppable>
                </table>
            </DragDropContext>
            </div>
            {
                Object.keys(message).length> 0 && message["status"] === "success"? <p style={{textAlign:'center', color:'green'}} >{message.messages}</p> : <p style={{textAlign:'center', color:'red'}} >{message.messages}</p>
            }
        </div>
    );
};

export default List;
