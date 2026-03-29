package com.college.assetmanager.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

@Service
public class QRCodeService {

    public byte[] generateQRCodeImage(String content, int width, int height) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(
                content, BarcodeFormat.QR_CODE, width, height
            );
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", stream);
            return stream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code: " 
                + e.getMessage());
        }
    }

    public byte[] generateAssetLabel(
            String assetId,
            String assetName,
            String category,
            String serialNo,
            String department,
            String room,
            String scanUrl) {

        try {
            // Step 1: Generate QR code as BufferedImage
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(
                scanUrl, BarcodeFormat.QR_CODE, 280, 280
            );
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(matrix);

            // Step 2: Create label canvas
            int width = 400;
            int height = 520;
            BufferedImage label = new BufferedImage(
                width, height, BufferedImage.TYPE_INT_RGB
            );
            Graphics2D g = label.createGraphics();

            // Rendering hints for crisp text
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            // Background
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, width, height);

            // Top header bar
            g.setColor(new Color(15, 17, 23));
            g.fillRect(0, 0, width, 36);

            // Header text: ASSETFLOW
            g.setColor(Color.WHITE);
            g.setFont(new Font("SansSerif", Font.BOLD, 14));
            FontMetrics fm = g.getFontMetrics();
            String headerText = "ASSETFLOW — CAMPUS ASSET MANAGEMENT";
            int headerX = (width - fm.stringWidth(headerText)) / 2;
            g.drawString(headerText, headerX, 23);

            // QR code centered
            int qrX = (width - 280) / 2;
            g.drawImage(qrImage, qrX, 46, null);

            // Divider line
            g.setColor(new Color(220, 220, 220));
            g.fillRect(20, 340, width - 40, 1);

            // Asset name — large bold
            g.setColor(new Color(15, 17, 23));
            g.setFont(new Font("SansSerif", Font.BOLD, 18));
            fm = g.getFontMetrics();
            String nameText = assetName != null ? assetName : "Unknown Asset";
            if (fm.stringWidth(nameText) > width - 40) {
                nameText = nameText.substring(0, 20) + "...";
            }
            int nameX = (width - fm.stringWidth(nameText)) / 2;
            g.drawString(nameText, nameX, 368);

            // Details rows
            g.setFont(new Font("SansSerif", Font.PLAIN, 12));
            g.setColor(new Color(100, 100, 100));
            int detailY = 395;
            int lineHeight = 22;

            drawLabelRow(g, "Category", category, 20, detailY, width);
            drawLabelRow(g, "Serial No", serialNo, 20, detailY + lineHeight, width);
            drawLabelRow(g, "Department", department, 20, 
                detailY + lineHeight * 2, width);
            drawLabelRow(g, "Room", room, 20, detailY + lineHeight * 3, width);

            // Asset ID footer
            g.setColor(new Color(180, 180, 180));
            g.setFont(new Font("SansSerif", Font.PLAIN, 10));
            String shortId = "ID: " + assetId.substring(0, 8).toUpperCase();
            g.drawString(shortId, 20, 500);

            // Bottom border
            g.setColor(new Color(79, 142, 247));
            g.fillRect(0, 510, width, 10);

            g.dispose();

            // Convert to PNG bytes
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            ImageIO.write(label, "PNG", output);
            return output.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate label: "
                + e.getMessage());
        }
    }

    private void drawLabelRow(Graphics2D g, String label, String value,
            int x, int y, int width) {
        g.setColor(new Color(130, 130, 130));
        g.drawString(label + ":", x, y);
        g.setColor(new Color(30, 30, 30));
        String val = value != null ? value : "—";
        g.drawString(val, x + 100, y);
    }
}