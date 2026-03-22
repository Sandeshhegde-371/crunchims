package com.example.Inventory.service;

public interface EmailService {
    void sendMail(String to, String subject, String body);
}