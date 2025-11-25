export const companyProfile = {
  name: "TAPAN CARGO SERVICE",
  gstin: "07AAMFT6165B1Z3",
  addressLines: [
    "1498 GROUND FLOOR STREET NO 3 WAZIR NAGAR KOTLA MUBARAKPUR",
    "BRANCH OFFICE :- SINGJAMEI THONGAM LEIKAI LANE NO 6",
    "JUNCTION IMPHAL WEST 795001",
  ],
  phonePrimary: "6909383936",
  phoneSecondary: "9818507416",
  email: "hindang2021b8@gmail.com",
};

export const bankDetails = {
  bankName: "HDFC BANK, NEW DELHI - DEFENCE COLONY",
  branch: "DEFENCE COLONY",
  accountName: "TAPAN ASSOCIATE CARGO SERVICE",
  accountNumber: "5010035168867",
  ifsc: "HDFC0000104",
};

export const paymentConfig = {
  upiVpa: process.env.NEXT_PUBLIC_UPI_VPA || "tapan@upi",
  upiPayeeName: process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "TAPAN CARGO SERVICE",
};
