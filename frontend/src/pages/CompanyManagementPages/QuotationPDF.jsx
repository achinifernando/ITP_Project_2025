import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontSize: 10, 
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  
  // Header Section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 20
  },
  
  companyInfo: {
    flex: 1
  },
  
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  },
  
  quotationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "right",
    flex: 1
  },
  
  // Quote Info Box
  quoteInfoBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20
  },
  
  quoteInfoTable: {
    borderWidth: 1,
    borderColor: "#000000"
  },
  
  quoteInfoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000"
  },
  
  quoteInfoHeaderCell: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    width: 80,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000000"
  },
  
  quoteInfoCell: {
    padding: 8,
    fontSize: 10,
    width: 80,
    textAlign: "center"
  },
  
  // Customer Info
  customerSection: {
    marginBottom: 20
  },
  
  customerHeader: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10
  },
  
  customerInfo: {
    marginLeft: 10,
    marginBottom: 10
  },
  
  // Description of Work
  descriptionSection: {
    marginBottom: 20
  },
  
  descriptionHeader: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5
  },
  
  descriptionBox: {
    borderWidth: 1,
    borderColor: "#000000",
    minHeight: 60,
    padding: 10
  },
  
  // Itemized Costs Table
  itemsSection: {
    marginBottom: 20
  },
  
  itemsHeader: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5
  },
  
  table: {
    borderWidth: 1,
    borderColor: "#000000"
  },
  
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000000"
  },
  
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    minHeight: 25
  },
  
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    justifyContent: "center"
  },
  
  tableCellDescription: {
    flex: 3,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#000000"
  },
  
  tableCellQty: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    textAlign: "center"
  },
  
  tableCellPrice: {
    flex: 1.5,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    textAlign: "right"
  },
  
  tableCellAmount: {
    flex: 1.5,
    padding: 5,
    fontSize: 10,
    textAlign: "right"
  },
  
  // Totals Section
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10
  },
  
  totalsTable: {
    width: 200,
    borderWidth: 1,
    borderColor: "#000000"
  },
  
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000"
  },
  
  totalLabelCell: {
    flex: 1,
    padding: 8,
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    textAlign: "center"
  },
  
  totalValueCell: {
    flex: 1,
    padding: 8,
    fontSize: 11,
    textAlign: "right",
    fontWeight: "bold"
  },
  
  // Footer
  footer: {
    marginTop: 30,
    fontSize: 9,
    textAlign: "center"
  },
  
  thankYouMessage: {
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center"
  },
  
  // Signature Section
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  
  signatureBox: {
    width: 200,
    height: 60,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 5
  },
  
  signatureLabel: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 5
  },
  
  preparedBy: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 10,
    marginBottom: 20
  }
});

const QuotationPDF = ({ data, company }) => {
  const total = data?.items?.reduce((sum, item) => (Number(item.quantity) || 0) * (Number(item.price) || 0) + sum, 0) || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.quotationTitle}>QUOTATION</Text>
          </View>
        </View>

        {/* Company & Quote Info */}
        <View style={styles.quoteInfoBox}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company?.name || "[Company Name]"}</Text>
            <Text>{company?.address || "[Street Address]"}</Text>
            <Text>Phone: {company?.phone || "(000) 000-0000"}</Text>
            <Text>{company?.email || "[E-mail Address]"}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <Text style={styles.customerHeader}>CUSTOMER INFO</Text>
          <View style={styles.customerInfo}>
            <Text>{data.userName || "[Name]"}</Text>
            <Text>{data.companyName || "[Company Name]"}</Text>
            <Text>{data.companyAddress || "[Street Address]"}</Text>
            <Text>{data.phoneNumber || "[Phone]"}</Text>
            <Text>{data.email || "[E-mail]"}</Text>
          </View>
        </View>

        {/* Description of Work */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionHeader}>DESCRIPTION OF WORK</Text>
          <View style={styles.descriptionBox}>
            <Text>Lorry category: {data.lorryCategory || ""}</Text>
            <Text>Lorry type: {data.lorryType || ""}</Text>
            <Text>Lorry model: {data.lorryModel || ""}</Text>
          </View>
        </View>

        {/* Itemized Costs */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsHeader}>ITEMIZED COSTS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableCellDescription}>DESCRIPTION</Text>
              <Text style={styles.tableCellQty}>QTY</Text>
              <Text style={styles.tableCellPrice}>UNIT PRICE</Text>
              <Text style={styles.tableCellAmount}>AMOUNT</Text>
            </View>
            {data?.items?.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCellDescription}>{item.name}</Text>
                <Text style={styles.tableCellQty}>{item.quantity}</Text>
                <Text style={styles.tableCellPrice}>{Number(item.price).toFixed(2)}</Text>
                <Text style={styles.tableCellAmount}>{(Number(item.quantity) * Number(item.price)).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelCell}>SUBTOTAL</Text>
              <Text style={styles.totalValueCell}>{total.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.totalLabelCell, { backgroundColor: "#d0d0d0" }]}>TOTAL QUOTE</Text>
              <Text style={[styles.totalValueCell, { fontSize: 12, fontWeight: "bold" }]}>{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This quotation is not a contract or a bill. It is our best estimate of the total price for the service and goods described above.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 5 }}>Customer Acceptance</Text>
            <View style={styles.signatureBox}></View>
            <Text style={styles.signatureLabel}>Printed Name</Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 5 }}>&nbsp;</Text>
            <View style={styles.signatureBox}></View>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;