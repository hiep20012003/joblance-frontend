// lib/pdf/invoiceGenerator.ts
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {formatPrice} from "@/lib/utils/helper";
import {formatISOTime} from "@/lib/utils/time";
import {IOrderDocument} from "@/types/order";

// Khai báo vfs (font ảo của pdfmake)
(pdfMake as any).vfs = pdfFonts; // Gán đối tượng vfs trực tiếp

export const generateInvoicePDF = (order: Required<IOrderDocument>) => {
    const grossPrice = order.price * order.quantity;

    const docDefinition: any = {
        content: [
            {
                columns: [
                    {text: "INVOICE", style: "header"},
                    {
                        stack: [
                            {text: "JobLance Platform", bold: true, fontSize: 10},
                            {text: "123 Freelance St, World Wide Web", fontSize: 9},
                        ],
                        alignment: "right",
                    },
                ],
            },
            {text: "\n"},
            {
                columns: [
                    {
                        stack: [
                            {text: "INVOICE TO:", bold: true, margin: [0, 0, 0, 4]},
                            {text: order.buyerUsername, bold: true},
                            {text: order.buyerEmail},
                        ],
                    },
                    {
                        stack: [
                            {text: `Invoice ID: ${order.invoiceId}`},
                            {text: `Date Issued: ${formatISOTime(order.dateOrdered, "month_day_year")}`},
                            {text: `Order ID: ${order._id}`},
                        ],
                        alignment: "right",
                    },
                ],
                margin: [0, 0, 0, 20],
            },
            {
                table: {
                    widths: ["*", "auto", "auto", "auto"],
                    headerRows: 1,
                    body: [
                        [
                            // Header row: Thêm padding cho tiêu đề
                            {text: "Description", bold: true, fillColor: "#f3f4f6", margin: [0, 5, 0, 5]},
                            {text: "Qty", bold: true, alignment: "right", fillColor: "#f3f4f6", margin: [0, 5, 0, 5]},
                            {
                                text: "Unit Price",
                                bold: true,
                                alignment: "right",
                                fillColor: "#f3f4f6",
                                margin: [0, 5, 0, 5]
                            },
                            {
                                text: "Amount",
                                bold: true,
                                alignment: "right",
                                fillColor: "#f3f4f6",
                                margin: [0, 5, 0, 5]
                            },
                        ],
                        [
                            // Data row 1: Thêm padding cho dữ liệu
                            {text: order.gigTitle, margin: [0, 3, 0, 3]},
                            {text: order.quantity.toString(), alignment: "right", margin: [0, 3, 0, 3]},
                            {text: formatPrice(order.price), alignment: "right", margin: [0, 3, 0, 3]},
                            {text: formatPrice(grossPrice), alignment: "right", margin: [0, 3, 0, 3]},
                        ],
                        [
                            // Data row 2 (Service Fee):
                            {text: "JobLance Service Fee", color: "#666", margin: [0, 3, 0, 3]},
                            {text: "-", alignment: "right", margin: [0, 3, 0, 3]},
                            {text: "-", alignment: "right", margin: [0, 3, 0, 3]},
                            {text: formatPrice(order.serviceFee), alignment: "right", margin: [0, 3, 0, 3]},
                        ],
                        [
                            // Total row: Thêm padding lớn hơn cho tổng cộng
                            {text: "TOTAL DUE", bold: true, colSpan: 3, alignment: "right", margin: [0, 8, 0, 8]},
                            {},
                            {},
                            {
                                text: formatPrice(order.totalAmount),
                                bold: true,
                                color: "#1d4ed8",
                                alignment: "right",
                                margin: [0, 8, 0, 8]
                            },
                        ],
                    ],
                },
                layout: "lightHorizontalLines",
            },
            {text: "\n"},
            {
                text: "Note: This is a purchase invoice issued by the platform for the Buyer’s tax and record-keeping purposes.",
                fontSize: 8,
                color: "#666",
                margin: [0, 15, 0, 0],
            },
        ],
        styles: {
            header: {fontSize: 22, bold: true, color: "#2563eb"},
        },
        defaultStyle: {fontSize: 10},
    };

    (pdfMake as any).createPdf(docDefinition).download(`Invoice-${order.invoiceId}.pdf`);
};
