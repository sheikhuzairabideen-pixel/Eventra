package com.devtiro.tickets;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TicketsApplication {

  public static void main(String[] args) {
    loadDotenv();
    SpringApplication.run(TicketsApplication.class, args);
  }

  private static void loadDotenv() {
    Path[] candidatePaths = new Path[] {
        Paths.get(".env"),
        Paths.get("backend/.env"),
        Paths.get("../.env")
    };

    for (Path path : candidatePaths) {
      if (Files.exists(path)) {
        try {
          List<String> lines = Files.readAllLines(path);
          for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
              continue;
            }
            int eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
              String key = trimmed.substring(0, eqIndex).trim();
              String value = trimmed.substring(eqIndex + 1).trim();

              if ((value.startsWith("\"") && value.endsWith("\"")) ||
                  (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length() - 1);
              }

              if (System.getProperty(key) == null && System.getenv(key) == null) {
                System.setProperty(key, value);
              }

              // Also map to Spring property naming conventions if needed
              if ("STRIPE_SECRET_KEY".equalsIgnoreCase(key) && System.getProperty("stripe.secret-key") == null) {
                System.setProperty("stripe.secret-key", value);
              }
              if ("STRIPE_PUBLISHABLE_KEY".equalsIgnoreCase(key) && System.getProperty("stripe.publishable-key") == null) {
                System.setProperty("stripe.publishable-key", value);
              }
            }
          }
          break;
        } catch (IOException ignored) {
        }
      }
    }
  }

}
