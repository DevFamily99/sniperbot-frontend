
import React, { useState } from 'react';

const defaultInitCustomerData = [
  { customer_id: 1, first_name: "Bob", last_name: "Smith", address: "87 Main St", address2: "Apt 87", city: "Los Angeles", state: "CA", zip_code: "17435" },
  { customer_id: 2, first_name: "Barb", last_name: "Belmont", address: "84 Palm", address2: null, city: "Petersburg", state: "AR", zip_code: "34625" },
  { customer_id: 3, first_name: "Jerry", last_name: "Seinfeld", address: "4876 22nd", address2: "4", city: "New York City", state: "NY", zip_code: "38756" },
  { customer_id: 4, first_name: "Yijun", last_name: "Li", address: "95 Cherry", address2: null, city: "Orlando", state: "FL", zip_code: "26564" },
  { customer_id: 5, first_name: "Corey", last_name: "Smith", address: "83573 Oregon Ave", address2: "Suite # 544", city: "Eagle Rock", state: "WA", zip_code: "97524" },
  { customer_id: 6, first_name: "Gloria", last_name: "Hernandez", address: "9 Pine Rd", address2: "2", city: "Sacramento", state: "CA", zip_code: "34655" }
];

const CustomerDirectory = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState({})
  const [initCustomerData, setInitCustomerData] = useState(defaultInitCustomerData)
  const handleEditCustomer = (data) => () => {
    setShowEditModal(true)
    setSelectedItem(data)
  }

  const setData = (data) => {
    let temp = [...initCustomerData]
    temp[data.customer_id - 1] = data
    setInitCustomerData(temp)
  }

  const Customer = ({ data }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{
          padding: '10px', margin: '10px',
          display: 'flex', flexDirection: 'column',
          boxShadow: '1px 1px 2px 1px rgba(0,0,0,0.1)',
          borderRadius: '5px', minWidth: '300px'
        }}>
          <b>Customer Address:</b>
          <div>{data.first_name} {data.last_name}</div>
          <div>{data.address}{data.address2 ? `, ${data.address2}` : ''}</div>
          <div>{data.city}, {data.state}, US {data.zip_code}</div>
          <button style={{ margin: '10px', cursor: 'pointer' }}
            data-toggle="modal"
            data-target="#myModal"
            onClick={handleEditCustomer(data)}>Edit</button>
        </div>
      </div>
    );
  };

  const EditModal = ({ selectedItem, setShowEditModal, setData }) => {
    const [userInfo, setUserInfo] = useState({ ...selectedItem })

    const handleChange = (field) => (e) => {
      userInfo[field] = e.target.value

      setUserInfo({ ...userInfo })
    }

    const handleSave = () => {
      setData({ ...userInfo })
      setShowEditModal(false)
    }

    return (
      <div id="myModal"
        className="modal fade"
        role="dialog"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: '10px'
        }}
        onClick={() => setShowEditModal(false)}
      >
        <div
          className="modal-dialog"
          style={{
            width: '500px',
            background: 'white',
            padding: '20px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Customer Info</h4>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <input
                  type="text"
                  value={userInfo.first_name}
                  onChange={handleChange('first_name')}
                  required
                />
                <div>
                  <input value={userInfo.last_name}
                    required
                    onChange={handleChange('last_name')}
                  />
                </div>
                <div>
                  <input value={userInfo.address}
                    required
                    onChange={handleChange('address')}
                  />
                </div>
                <div>
                  <input value={userInfo.address2}
                    onChange={handleChange('address2')}
                  />
                </div>
                <div>
                  <input value={userInfo.city}
                    onChange={handleChange('city')}
                    required
                  />
                </div>
                <div>
                  <input value={userInfo.state}
                    onChange={handleChange('state')}
                    required
                  />
                </div>
                <div>
                  <input value={userInfo.zip_code}
                    onChange={handleChange('zip_code')}
                    required
                  />
                </div>
                <input type="submit"
                  className="btn btn-default"
                  value="Save"
                />
                <button type="button"
                  className="btn btn-default"
                  data-dismiss="modal"
                  onClick={() => setShowEditModal(false)}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginLeft: '10px' }}>Customers:</h1>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {initCustomerData.map(customer => <Customer key={customer.customer_id}
          data={customer} />)}
      </div>
      {showEditModal && <EditModal
        setShowEditModal={setShowEditModal}
        selectedItem={selectedItem}
        setData={setData}
      />}
    </div>
  );
};

export default CustomerDirectory;
