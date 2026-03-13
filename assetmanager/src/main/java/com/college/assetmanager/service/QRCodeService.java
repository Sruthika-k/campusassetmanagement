package com.college.assetmanager.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.io.File;
import java.awt.image.BufferedImage;
import java.util.UUID;

@Service
public class QRCodeService {

    public String generateQRCode(UUID assetId) throws Exception {

        String url = "http://192.168.29.122:8080/api/assets/" + assetId;

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, 250, 250);

        BufferedImage image = new BufferedImage(250, 250, BufferedImage.TYPE_INT_RGB);

        for (int x = 0; x < 250; x++) {
            for (int y = 0; y < 250; y++) {
                image.setRGB(x, y, bitMatrix.get(x, y) ? 0x000000 : 0xFFFFFF);
            }
        }

        String path = "qrcodes/" + assetId + ".png";

        File output = new File(path);
        output.getParentFile().mkdirs();

        ImageIO.write(image, "PNG", output);

        return path;
    }
}