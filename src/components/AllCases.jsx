  // "serviceRequestNumber": "<a target=\"_blank\" href=\"http://localhost/Code.UI/ComCon/Tab/RenderTab?tabName=casedetails&id=234\">HOME0000234</a>",
  // "fullAddress": "<a target=\"_blank\" href=\"http://ccris2/Property/IDM/Authentication/ValidateToken?jwtToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJZFwiOjE5MzM5MSxcIlVzZXJuYW1lXCI6XCJqaXRiYW5lcmplZUB5b3BtYWlsLmNvbVwiLFwiRW1haWxcIjpcImppdGJhbmVyamVlQHlvcG1haWwuY29tXCIsXCJQcm92aWRlclwiOlwiU1FMXCJ9IiwiaXNzIjoiSENJRExBLUpXVFRPS0VOU0VSVklDRSIsImF1ZCI6Imh0dHA6Ly93d3cubGFjaXR5Lm9yZyIsImV4cCI6MTczOTU4MjQyMCwibmJmIjoxNzM5NDk2MDIwfQ.BSS98YaRMtkfN8SgQTgsY6Od-7YELG1sg9U8mDFgrtQ&tabName=Property&parameters=apn=5154003012\">240 S WESTLAKE AVE LOS ANGELES</a>",
  // "status": "Case Closed",
  // "dateOpened": null,
  // "apn": "<a target=\"_blank\" href=\"http://ccris2/Property/IDM/Authentication/ValidateToken?jwtToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJZFwiOjE5MzM5MSxcIlVzZXJuYW1lXCI6XCJqaXRiYW5lcmplZUB5b3BtYWlsLmNvbVwiLFwiRW1haWxcIjpcImppdGJhbmVyamVlQHlvcG1haWwuY29tXCIsXCJQcm92aWRlclwiOlwiU1FMXCJ9IiwiaXNzIjoiSENJRExBLUpXVFRPS0VOU0VSVklDRSIsImF1ZCI6Imh0dHA6Ly93d3cubGFjaXR5Lm9yZyIsImV4cCI6MTczOTU4MjQyMCwibmJmIjoxNzM5NDk2MDIwfQ.BSS98YaRMtkfN8SgQTgsY6Od-7YELG1sg9U8mDFgrtQ&tabName=Property&parameters=apn=5154003012\">5154003012</a>",
  // "inspectorEmail": null,
  // "inspector": null,
  // "dateScheduled": null,
  // "actionDate": "05/15/2023",
  // "serviceRequestID": 234,
  // "lastInspected": null


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import parseHTML from "../services/parser";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllCases } from "../store/allCasesSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function AllCases() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.cases);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); 
  const [modalData, setModalData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRowsSelected, setIsRowSelected] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  
  const tableContainerRef = useRef(null);
  
  // Filter data based on search term
  const filteredData = data.filter((item) => {

    const searchFields = [
      String(item.serviceRequestID || ""),
      parseHTML(item.serviceRequestNumber || "").text || "",
      parseHTML(item.fullAddress || "").text || "",
      parseHTML(item.apn || "").text || "",
      item.actionDate || "",
      item.status || "",
    ];
    
    return searchFields.some((field) => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Sort data based on sortConfig
  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Extract text from HTML or use plain values
        let aValue, bValue;
        
        if (sortConfig.key === "serviceRequestNumber" || 
            sortConfig.key === "fullAddress" || 
            sortConfig.key === "apn") {
          aValue = parseHTML(a[sortConfig.key] || "").text || "";
          bValue = parseHTML(b[sortConfig.key] || "").text || "";
        } else {
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
        }
        
        // Case insensitive string comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);
  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    
    return sortConfig.direction === "ascending" ? 
      <span className="ml-1">▲</span> : 
      <span className="ml-1">▼</span>;
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAllCases());
    }
  }, [status, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      const newSelectedRows = { ...prev };
      newSelectedRows[id] = !newSelectedRows[id];
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedRows = { ...selectedRows };
    currentData.forEach(item => {
      newSelectedRows[item.serviceRequestID] = newSelectAll;
    });
    
    setSelectedRows(newSelectedRows);
  };

  const handleSearch = (e) => {
    let tempTerm = e.target.value
    setSearchTerm(tempTerm.trim());
  };

  const toggleDropdown = (id) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId !== null && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const openModal = (type, data) => {
    setActiveModal(type);
    setModalData(data);
    setOpenDropdownId(null); 
  };
  
  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const handleSend = async ()=>{
    setIsProcessing(true)
    const selectedData  = data.filter((d)=>{
      return selectedRows[d.serviceRequestID] == true
    })

    console.log(selectedData)
    const formattedData = selectedData.map(item => ({
      serviceRequestID: item.serviceRequestID,
      serviceRequestNumber: parseHTML(item.serviceRequestNumber || "").text || "",
      fullAddress: parseHTML(item.fullAddress || "").text || "",
      apn: parseHTML(item.apn || "").text || "",
      actionDate: item.actionDate || "",
      status: item.status || "",
      dateOpened: item.dateOpened || "",
      dateScheduled: item.dateScheduled || "",
      inspector: item.inspector || "",
      inspectorEmail: item.inspectorEmail || "",
      lastInspected: item.lastInspected || ""
    }));

    const response = await axios.post('https://localhost:7288/api/allcases/send', formattedData);
    setIsProcessing(false)
    console.log("Response:", response.data);

  }

  const handleReturn = async ()=>{
    setIsProcessing(true)
    const selectedData  = data.filter((d)=>{
      return selectedRows[d.serviceRequestID] == true
    })
    console.log(selectedData)
    const formattedData = selectedData.map(item => ({
      serviceRequestID: item.serviceRequestID,
      serviceRequestNumber: parseHTML(item.serviceRequestNumber || "").text || "",
      fullAddress: parseHTML(item.fullAddress || "").text || "",
      apn: parseHTML(item.apn || "").text || "",
      actionDate: item.actionDate || "",
      status: item.status || "",
      dateOpened: item.dateOpened || "",
      dateScheduled: item.dateScheduled || "",
      inspector: item.inspector || "",
      inspectorEmail: item.inspectorEmail || "",
      lastInspected: item.lastInspected || ""
    }));

    const response = await axios.post('https://localhost:7288/api/allcases/return', formattedData);
    setIsProcessing(false);
    console.log("Response:", response.data);

  }

  useEffect(()=>{
    if(selectedRows.length == 0){
      setIsRowSelected(false)
    }else{
      let countNumberOfRows = 0
      for (const key in selectedRows) {
        if(selectedRows[key] == true){
          countNumberOfRows+=1
        }
      }
      if(countNumberOfRows > 0){
        setIsRowSelected(true)
      }else{
        setIsRowSelected(false)
      }
    } 
  }, [selectedRows])

  const handleActionChange = ((e)=>{
    setSelectedAction(e.target.value)
  })

  const handleActionSubmit = (()=>{
    if(selectedAction == "" || selectedAction == null){
      alert("PLEASE SELECT AN ACTION")
      return
    }else{
      if(isRowsSelected){
        if(selectedAction == "sendToCode"){
          handleReturn();
        }else if(selectedAction == "referToHearing")[
          handleSend()
        ]
      }else{
        alert("Please select row(s)")
      }
    }
    
  })

  const renderModal = () => {
    if (!activeModal) return null;
  
    const modalTitle = {
      dashboard: "Case Dashboard",
      settings: "Case Settings",
      earnings: "Case Earnings"
    }[activeModal];
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {modalTitle} - {modalData?.serviceRequestID || ""}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {activeModal === 'dashboard' && (
              <div>
                <p className="mb-4">View dashboard information for case {modalData?.serviceRequestID}</p>
                <p><strong>Address:</strong> {parseHTML(modalData?.fullAddress || "").text}</p>
                <p><strong>Status:</strong> {modalData?.status}</p>
                <p><strong>Action Date:</strong> {modalData?.actionDate}</p>
              </div>
            )}
  
            {activeModal === 'settings' && (
              <div>
                <p className="mb-4">Change settings for case {modalData?.serviceRequestID}</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>Case Open</option>
                    <option>In Progress</option>
                    <option>Case Closed</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Inspector
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>John Smith</option>
                    <option>Jane Doe</option>
                    <option>Mike Johnson</option>
                  </select>
                </div>
              </div>
            )}
  
            {activeModal === 'earnings' && (
              <div>
                <p className="mb-4">Case earnings and financial details for {modalData?.serviceRequestID}</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Inspection Fees:</span>
                    <span>$250.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Permit Fees:</span>
                    <span>$175.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Violation Fees:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>$425.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              onClick={closeModal}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-2"
            >
              Cancel
            </button>
            <button
              onClick={closeModal}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <div>Error: {error.message}</div>;
  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <div>
          <label htmlFor="itemsPerPage" className="mr-2 font-medium">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border p-1 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="inline-flex items-center space-x-2">
          <div className="relative">
            <select onChange={(e) => handleActionChange(e)} className="bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
              <option value="" defaultValue>Select an Action</option>
              <option value="sendToCode" disabled={!isRowsSelected}>Send back to Code</option>
              <option value="referToHearing" disabled={!isRowsSelected}>Refer to Hearing</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
          <button type="button" disabled={isProcessing} onClick={handleActionSubmit} className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800">
            {isProcessing ? (
              <>Processing <FontAwesomeIcon icon={faSpinner} spin /></>
            ) : (
              <>Send <FontAwesomeIcon icon={faPaperPlane} /></>
            )}
          </button>
        </div>
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Search cases..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg" ref={tableContainerRef}>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                <div className="inline-flex items-center">
                  <label className="flex items-center cursor-pointer relative">
                    <input 
                      type="checkbox" 
                      checked={selectAll} 
                      onChange={handleSelectAll} 
                      className="peer h-6 w-6 cursor-pointer transition-all appearance-none rounded-full bg-slate-100 shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800" 
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                  </label>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort("serviceRequestID")}
              >
                <div className="flex items-center">
                  Service Request Id
                  {getSortIndicator("serviceRequestID")}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort("serviceRequestNumber")}
              >
                <div className="flex items-center">
                  Service Request Number
                  {getSortIndicator("serviceRequestNumber")}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort("fullAddress")}
              >
                <div className="flex items-center">
                  Full Address
                  {getSortIndicator("fullAddress")}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort("apn")}
              >
                <div className="flex items-center">
                  APN
                  {getSortIndicator("apn")}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort("actionDate")}
              >
                <div className="flex items-center">
                  Action Date
                  {getSortIndicator("actionDate")}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {getSortIndicator("status")}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 hover:bg-gray-200"
              >
                <div className="flex items-center">
                  Action
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((d, index) => (
                <tr
                  key={d.serviceRequestID}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } border-b border-gray-200 hover:bg-slate-300`}
                >
                  <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                    <div className="inline-flex items-center">
                      <label className="flex items-center cursor-pointer relative">
                        <input 
                          type="checkbox"   
                          checked={!!selectedRows[d.serviceRequestID]} 
                          onChange={() => handleRowSelect(d.serviceRequestID)} 
                          className="peer h-6 w-6 cursor-pointer transition-all appearance-none rounded-full bg-slate-100 shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800" 
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                    {d.serviceRequestID}
                  </td>
                  <td className="px-6 py-2">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={parseHTML(d.serviceRequestNumber).href}
                      className="text-blue-600 hover:underline"
                    >
                      {parseHTML(d.serviceRequestNumber).text}
                    </a>
                  </td>
                  <td className="px-6 py-2">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={parseHTML(d.fullAddress).href}
                      className="text-blue-600 hover:underline"
                    >
                      {parseHTML(d.fullAddress).text}
                    </a>
                  </td>
                  <td className="px-6 py-2">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={parseHTML(d.apn).href}
                      className="text-blue-600 hover:underline"
                    >
                      {parseHTML(d.apn).text}
                    </a>
                  </td>
                  <td className="px-6 py-2">
                    {d.actionDate || "NOT AVAILABLE"}
                  </td>
                  <td className="px-6 py-2">{d.status || "NOT AVAILABLE"}</td>
                  <td className="px-6 py-2">
                    <div className="dropdown-container relative">
                      <button 
                        onClick={() => toggleDropdown(d.serviceRequestID)}
                        className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50" 
                        type="button"
                      >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
                          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                        </svg>
                      </button>
                      
                      {openDropdownId === d.serviceRequestID && (
                        <div className="absolute right-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 mt-2">
                          <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownMenuIconButton">
                            <li>
                              <button 
                                onClick={() => openModal('dashboard', d)} 
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Dashboard
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={() => openModal('settings', d)} 
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Settings
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={() => openModal('earnings', d)} 
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Earnings
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-2 text-center">
                  {searchTerm ? "No matching records found" : "No records available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <nav className="flex items-center py-4 bg-gray-100" aria-label="Table navigation">
          <span className="text-sm font-normal text-gray-500 ml-5 flex items-center">
            Showing <span className="font-semibold text-gray-500 mx-1">
              {sortedData.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, sortedData.length)}
            </span> of <span className="font-semibold text-gray-500 ml-1">{sortedData.length}</span>
          </span>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8 ml-auto mr-4">
            <li>
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">First</button>
            </li>
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300  hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
            </li>
            {getPageNumbers().map((number) => (
              <li key={number}>
                <button
                  onClick={() => handlePageChange(number)}
                  className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 
                    ${number === currentPage
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                      : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {number}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </li>
            <li>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Last</button>
            </li>
          </ul>
        </nav>
      </div>
      {renderModal()}
    </div>
  );
}