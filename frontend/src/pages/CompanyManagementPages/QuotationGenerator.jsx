import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import QuotationPDF from "./QuotationPDF";
import "../../CSS/ClientPortalCSS/quotationGenerator.css";
import { useParams } from "react-router-dom";

function QuotationForm() {
  const { requestID } = useParams();
  const [client, setClient] = useState(null);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [models, setModels] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    companyAddress: "",
    lorryCategory: "",
    lorryType: "",
    lorryModel: "",
    items: [],
  });

  // Fetch client info
  useEffect(() => {
    axios
      .get(`http://localhost:5000/quotationRequest/${requestID}`)
      .then((res) => {
        const request = res.data;
        const client = request.clientID;

        setClient(client);

        setFormData((prev) => ({
          ...prev,
          userName: client.name || "",
          email: client.email || "",
          phoneNumber: client.phone || "",
          companyName: client.companyName || "",
          companyAddress: client.companyAddress || "",
          lorryCategory: request.lorryCategory?._id || "",
          lorryType: request.lorryType?._id || "",
          lorryModel: request.lorryModel?._id || "",
        }));
      })
      .catch(console.error);
  }, [requestID]);

  // Fetch categories
  useEffect(() => {
    axios.get("http://localhost:5000/lorryCategories/products")
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  // Fetch types when category changes
  useEffect(() => {
    if (formData.lorryCategory) {
      axios.get(`http://localhost:5000/lorryType/category/${formData.lorryCategory}`)
        .then((res) => setTypes(res.data))
        .catch(console.error);
    } else {
      setTypes([]);
    }
  }, [formData.lorryCategory]);

  // Fetch models
  useEffect(() => {
    axios.get(`http://localhost:5000/lorryBrands/models`)
      .then((res) => setModels(res.data))
      .catch(console.error);
  }, []);

  // Fetch stock items
  useEffect(() => {
    axios.get("http://localhost:5000/stock/items")
      .then((res) => setStockItems(res.data))
      .catch(console.error);
  }, []);

  // Derived total price
  const totalPrice = formData.items
    .reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
    .toFixed(2);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === "lorryCategory" && { lorryType: "", lorryModel: "" }),
    });
  };

  // Add item from stock
  const addItem = (itemId) => {
    if (!itemId) return;
    const stockItem = stockItems.find((i) => i._id === itemId);
    if (!stockItem) return;

    // Prevent duplicate items
    setFormData((prev) => ({
      ...prev,
      items: prev.items.some(i => i._id === stockItem._id)
        ? prev.items
        : [...prev.items, { _id: stockItem._id, name: stockItem.item, quantity: 1, price: stockItem.price }],
    }));
  };

  // Update or delete items
  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.items.map((item, i) =>
        i === index
          ? { ...item, [field]: ["quantity", "price"].includes(field) ? Number(value) || 0 : value }
          : item
      );
      return { ...prev, items: updated };
    });
  };

  const deleteItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Send quotation
  const handleSendEmail = async () => {
    if (!client) return alert("Client info is still loading...");
    try {
      const blob = await pdf(
        <QuotationPDF
          data={{ ...formData, remarks }}
          company={{
            name: "Nimal Engineering Works and Lorry Body Builders",
            address: "NO 483, Kandy Road, Aluthgama Bogamuwa, Yakkala",
            phone: "0776336363 / 0332050196",
            email: "nimalengworks@gmail.com",
            logo: "/Nimal_Eng_logo.jpeg",
          }}
        />
      ).toBlob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(",")[1];
        const res = await axios.post(`http://localhost:5000/quotations/generate-quotation/${requestID}`, {
          ...formData,
          remarks,
          totalPrice: Number(totalPrice),
          clientID: client._id,
          clientEmail: client.email,
          requestID: requestID,
          pdfBase64: base64,
        });

        alert(res.data.message);
      };
    } catch (err) {
      console.error(err);
      alert("Error sending quotation.");
    }
  };

  const companyInfo = {
    name: "Nimal Engineering Works and Lorry Body Builders",
    address: "NO 483, Kandy Road, Aluthgama Bogamuwa, Yakkala",
    phone: "0776336363 / 0332050196",
    email: "nimalengworks@gmail.com",
    logo: "/Nimal_Eng_logo.jpeg",
  };

  const memoizedPDF = useMemo(() => (
    <QuotationPDF data={{ ...formData, remarks }} company={companyInfo} />
  ), [formData, remarks]);

  return (
    <div className="quotation-form-wrapper">
      <div className="quotation-form-container">
        <h1 className="title">Quotation Generator</h1>
        <form>
          <input name="userName" placeholder="Name" value={formData.userName} onChange={handleChange} required />
          <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} />
          <input name="companyAddress" placeholder="Address" value={formData.companyAddress} onChange={handleChange} />
          <input name="lorryCategory" placeholder="Lorry Category" value={formData.lorryCategory} onChange={handleChange} />
          <input name="lorryType" placeholder="Lorry Type" value={formData.lorryType} onChange={handleChange} />
          <input name="lorryModel" placeholder="Lorry Model" value={formData.lorryModel} onChange={handleChange} />

          {/* Items Section */}
          <div className="items-section">
            <h3>Items</h3>
            <select onChange={(e) => addItem(e.target.value)}>
              <option value="">Add item from stock</option>
              {stockItems.map((item) => (
                <option key={item._id} value={item._id}>{item.item}</option>
              ))}
            </select>

            {formData.items.map((item, index) => (
              <div key={index} className="item-row">
                <input type="text" value={item.name} readOnly />
                <input type="number" value={item.quantity} min="1" placeholder="Qty" onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                <input type="number" value={item.price} placeholder="Price" onChange={(e) => updateItem(index, "price", e.target.value)} />
                <button type="button" onClick={() => deleteItem(index)} className="delete-btn">Delete</button>
              </div>
            ))}
          </div>

          <input type="text" name="totalPrice" placeholder="Total Price" value={totalPrice} readOnly />
          <textarea placeholder="Remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <button type="button" className="btn-submit" onClick={handleSendEmail}>
            Send Quotation to Client
          </button>
        </form>
      </div>

      <div className="quotation-preview">
        <h2>Live Quotation Preview</h2>
        <div className="pdf-viewer-container">
          <PDFViewer style={{ width: "100%", height: "500px" }}>
            {memoizedPDF}
          </PDFViewer>
        </div>
        <PDFDownloadLink document={memoizedPDF} fileName={`quotation-${requestID}.pdf`}>
          {({ loading }) =>
            loading ? <button disabled className="btn-disabled">Generating PDF...</button> : <button className="btn-submit">Download PDF</button>
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
}

export default QuotationForm;
