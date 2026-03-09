-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: vilcom
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addons`
--

DROP TABLE IF EXISTS `addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('static_ip','extra_bandwidth','extra_storage','router_upgrade','ssl_certificate','backup_service','domain_registration','email_accounts','priority_support','installation','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `applicable_to` json DEFAULT NULL,
  `price_monthly` decimal(10,2) DEFAULT NULL,
  `price_quarterly` decimal(10,2) DEFAULT NULL,
  `price_semi_annually` decimal(10,2) DEFAULT NULL,
  `price_annually` decimal(10,2) DEFAULT NULL,
  `price_one_time` decimal(10,2) DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `min_quantity` int NOT NULL DEFAULT '1',
  `max_quantity` int DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  `bundle_rules` json DEFAULT NULL,
  `can_be_bundled` tinyint(1) NOT NULL DEFAULT '1',
  `bundle_discount_percent` decimal(5,2) DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `requires_approval` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `addons_slug_unique` (`slug`),
  UNIQUE KEY `addons_sku_unique` (`sku`),
  KEY `addons_type_index` (`type`),
  KEY `addons_slug_index` (`slug`),
  KEY `addons_sku_index` (`sku`),
  KEY `addons_is_active_index` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addons`
--

LOCK TABLES `addons` WRITE;
/*!40000 ALTER TABLE `addons` DISABLE KEYS */;
INSERT INTO `addons` VALUES (1,'Static IP Address','static-ip','Get a dedicated static IP address for your connection','Dedicated static IP','ADDON-STATIC-IP','static_ip','[\"internet_plan\"]',500.00,NULL,NULL,NULL,NULL,1,1,NULL,NULL,NULL,1,NULL,'fa-network-wired',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(2,'Mesh WiFi System','mesh-wifi','Upgrade to a mesh WiFi system for better coverage','Better WiFi coverage','ADDON-MESH-WIFI','router_upgrade','[\"internet_plan\"]',NULL,NULL,NULL,NULL,5000.00,0,1,NULL,NULL,NULL,1,NULL,'fa-wifi',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(3,'Priority Installation','priority-install','Get installed within 24 hours','Same-day installation','ADDON-PRIORITY-INSTALL','installation','[\"internet_plan\"]',NULL,NULL,NULL,NULL,2000.00,0,1,NULL,NULL,NULL,1,NULL,'fa-clock',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(4,'SSL Certificate','ssl-certificate','Premium SSL certificate for your website','Secure your website','ADDON-SSL','ssl_certificate','[\"hosting_package\"]',NULL,NULL,NULL,3000.00,NULL,1,1,NULL,NULL,NULL,1,NULL,'fa-lock',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(5,'Daily Backups','daily-backups','Automated daily backups of your website','Automatic daily backups','ADDON-BACKUP','backup_service','[\"hosting_package\"]',500.00,NULL,NULL,NULL,NULL,1,1,NULL,NULL,NULL,1,NULL,'fa-database',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(6,'Extra 50GB Storage','extra-storage','Add 50GB of additional SSD storage','Expand your storage','ADDON-STORAGE-50GB','extra_storage','[\"hosting_package\"]',1000.00,NULL,NULL,NULL,NULL,1,1,NULL,NULL,NULL,1,NULL,'fa-hdd',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(7,'Priority Support','priority-support','24/7 priority support with faster response times','Get help faster','ADDON-PRIORITY-SUPPORT','priority_support','[\"internet_plan\", \"hosting_package\"]',1500.00,NULL,NULL,NULL,NULL,1,1,NULL,NULL,NULL,1,NULL,'fa-headset',NULL,NULL,1,0,0,0,NULL,NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09');
/*!40000 ALTER TABLE `addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `address_check_logs`
--

DROP TABLE IF EXISTS `address_check_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address_check_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `query_input` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matched_zone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_covered` tinyint(1) NOT NULL DEFAULT '0',
  `query_lat` decimal(10,8) DEFAULT NULL,
  `query_lng` decimal(11,8) DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_result` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `address_check_logs_user_id_foreign` (`user_id`),
  KEY `address_check_logs_is_covered_index` (`is_covered`),
  KEY `address_check_logs_query_input_index` (`query_input`),
  KEY `address_check_logs_created_at_index` (`created_at`),
  CONSTRAINT `address_check_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address_check_logs`
--

LOCK TABLES `address_check_logs` WRITE;
/*!40000 ALTER TABLE `address_check_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `address_check_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `target_logged_in` tinyint(1) NOT NULL DEFAULT '1',
  `target_guests` tinyint(1) NOT NULL DEFAULT '1',
  `target_roles` json DEFAULT NULL,
  `cta_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cta_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `banners_created_by_foreign` (`created_by`),
  KEY `banners_position_is_active_order_index` (`position`,`is_active`,`order`),
  CONSTRAINT `banners_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('internet_plans','hosting_packages','web_development','bulk_sms','domains','addons','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attributes` json DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `show_in_menu` tinyint(1) NOT NULL DEFAULT '1',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `meta_keywords` text COLLATE utf8mb4_unicode_ci,
  `_lft` int NOT NULL DEFAULT '0',
  `_rgt` int NOT NULL DEFAULT '0',
  `depth` int NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_index` (`parent_id`),
  KEY `categories_type_index` (`type`),
  KEY `categories_slug_index` (`slug`),
  KEY `categories_is_active_index` (`is_active`),
  KEY `categories_is_featured_index` (`is_featured`),
  KEY `categories_sort_order_index` (`sort_order`),
  KEY `categories__lft__rgt_index` (`_lft`,`_rgt`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Internet Plans','internet-plans','High-speed fiber and wireless internet packages for homes and businesses','Reliable internet connectivity solutions','internet_plans','fas fa-wifi',NULL,NULL,'#3B82F6',NULL,1,1,1,1,'Internet Plans - High-Speed Fiber & Wireless','Affordable high-speed internet plans for homes and businesses in Kenya',NULL,1,14,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(2,1,'Home Internet','home-internet','Internet packages designed for residential use',NULL,'internet_plans','fas fa-home',NULL,NULL,'#10B981',NULL,1,0,1,1,NULL,NULL,NULL,2,3,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(3,1,'Home Fiber','home-fiber','Ultra-fast fiber optic internet for homes',NULL,'internet_plans','fas fa-fiber-optic',NULL,NULL,'#10B981',NULL,2,0,1,1,NULL,NULL,NULL,4,5,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(4,1,'Business Internet','business-internet','Enterprise-grade internet solutions for businesses',NULL,'internet_plans','fas fa-building',NULL,NULL,'#8B5CF6',NULL,3,0,1,1,NULL,NULL,NULL,6,7,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(5,1,'Business Fiber','business-fiber','Enterprise fiber optic connections for businesses',NULL,'internet_plans','fas fa-network-wired',NULL,NULL,'#8B5CF6',NULL,4,0,1,1,NULL,NULL,NULL,8,9,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(6,1,'Fiber Internet','fiber-internet','Ultra-fast fiber optic internet connections',NULL,'internet_plans','fas fa-network-wired',NULL,NULL,'#F59E0B',NULL,5,0,1,1,NULL,NULL,NULL,10,11,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(7,1,'Wireless Internet','wireless-internet','Flexible wireless broadband solutions',NULL,'internet_plans','fas fa-broadcast-tower',NULL,NULL,'#EC4899',NULL,6,0,1,1,NULL,NULL,NULL,12,13,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(8,NULL,'Web Hosting','web-hosting','Reliable and secure web hosting solutions','Hosting packages for websites and applications','hosting_packages','fas fa-server',NULL,NULL,'#EF4444',NULL,2,1,1,1,NULL,NULL,NULL,15,24,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(9,8,'Shared Hosting','shared-hosting','Affordable hosting for small websites',NULL,'hosting_packages','fas fa-share-alt',NULL,NULL,NULL,NULL,1,0,1,1,NULL,NULL,NULL,16,17,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(10,8,'VPS Hosting','vps-hosting','Virtual private servers for growing businesses',NULL,'hosting_packages','fas fa-hdd',NULL,NULL,NULL,NULL,2,0,1,1,NULL,NULL,NULL,18,19,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(11,8,'Dedicated Hosting','dedicated-hosting','Powerful dedicated servers for high-traffic sites',NULL,'hosting_packages','fas fa-server',NULL,NULL,NULL,NULL,3,0,1,1,NULL,NULL,NULL,20,21,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(12,8,'Reseller Hosting','reseller-hosting','Start your own hosting business',NULL,'hosting_packages','fas fa-handshake',NULL,NULL,NULL,NULL,4,0,1,1,NULL,NULL,NULL,22,23,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(13,NULL,'Web Development','web-development','Professional website design and development services','Custom websites and web applications','web_development','fas fa-code',NULL,NULL,'#6366F1',NULL,3,1,1,1,NULL,NULL,NULL,25,32,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(14,13,'Business Websites','business-websites','Professional websites for businesses',NULL,'web_development','fas fa-briefcase',NULL,NULL,NULL,NULL,1,0,1,1,NULL,NULL,NULL,26,27,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(15,13,'E-commerce','ecommerce','Online store development',NULL,'web_development','fas fa-shopping-cart',NULL,NULL,NULL,NULL,2,0,1,1,NULL,NULL,NULL,28,29,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(16,13,'Custom Applications','custom-applications','Tailored web applications',NULL,'web_development','fas fa-cogs',NULL,NULL,NULL,NULL,3,0,1,1,NULL,NULL,NULL,30,31,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(17,NULL,'Bulk SMS','bulk-sms','Bulk SMS services for marketing and notifications','SMS messaging solutions','bulk_sms','fas fa-sms',NULL,NULL,'#14B8A6',NULL,4,0,1,1,NULL,NULL,NULL,33,34,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(18,NULL,'Domain Names','domain-names','Domain registration and management services','Register your perfect domain name','domains','fas fa-globe',NULL,NULL,'#F97316',NULL,5,0,1,1,NULL,NULL,NULL,35,36,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(19,NULL,'Add-ons & Extras','addons-extras','Additional services and equipment','Enhance your services','addons','fas fa-plus-circle',NULL,NULL,'#64748B',NULL,6,0,1,0,NULL,NULL,NULL,37,46,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(20,19,'Static IP Address','static-ip','Dedicated static IP address',NULL,'addons','fas fa-network-wired',NULL,NULL,NULL,NULL,1,0,1,1,NULL,NULL,NULL,38,39,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(21,19,'Email Hosting','email-hosting','Professional email accounts',NULL,'addons','fas fa-envelope',NULL,NULL,NULL,NULL,2,0,1,1,NULL,NULL,NULL,40,41,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(22,19,'SSL Certificates','ssl-certificates','Secure your website with SSL',NULL,'addons','fas fa-lock',NULL,NULL,NULL,NULL,3,0,1,1,NULL,NULL,NULL,42,43,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(23,19,'Equipment','equipment','Routers, modems, and networking equipment',NULL,'addons','fas fa-router',NULL,NULL,NULL,NULL,4,0,1,1,NULL,NULL,NULL,44,45,0,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coverage_interest_signups`
--

DROP TABLE IF EXISTS `coverage_interest_signups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coverage_interest_signups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `status` enum('pending','contacted','covered','not_viable') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coverage_interest_signups_status_index` (`status`),
  KEY `coverage_interest_signups_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coverage_interest_signups`
--

LOCK TABLES `coverage_interest_signups` WRITE;
/*!40000 ALTER TABLE `coverage_interest_signups` DISABLE KEYS */;
/*!40000 ALTER TABLE `coverage_interest_signups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coverage_zone_packages`
--

DROP TABLE IF EXISTS `coverage_zone_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coverage_zone_packages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coverage_zone_id` bigint unsigned NOT NULL,
  `package_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `speed_mbps_down` decimal(10,2) NOT NULL,
  `speed_mbps_up` decimal(10,2) NOT NULL,
  `monthly_price` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `features` json DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coverage_zone_packages_coverage_zone_id_index` (`coverage_zone_id`),
  KEY `coverage_zone_packages_is_available_index` (`is_available`),
  KEY `coverage_zone_packages_sort_order_index` (`sort_order`),
  CONSTRAINT `coverage_zone_packages_coverage_zone_id_foreign` FOREIGN KEY (`coverage_zone_id`) REFERENCES `coverage_zones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coverage_zone_packages`
--

LOCK TABLES `coverage_zone_packages` WRITE;
/*!40000 ALTER TABLE `coverage_zone_packages` DISABLE KEYS */;
/*!40000 ALTER TABLE `coverage_zone_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coverage_zones`
--

DROP TABLE IF EXISTS `coverage_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coverage_zones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('area','zone','region','county','sub-county') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'area',
  `parent_id` bigint unsigned DEFAULT NULL,
  `geojson` json DEFAULT NULL,
  `center_lat` decimal(10,8) DEFAULT NULL,
  `center_lng` decimal(11,8) DEFAULT NULL,
  `radius_km` decimal(8,2) DEFAULT NULL,
  `status` enum('active','inactive','planned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `is_serviceable` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coverage_zones_slug_unique` (`slug`),
  KEY `coverage_zones_slug_index` (`slug`),
  KEY `coverage_zones_type_index` (`type`),
  KEY `coverage_zones_status_index` (`status`),
  KEY `coverage_zones_is_serviceable_index` (`is_serviceable`),
  KEY `coverage_zones_parent_id_index` (`parent_id`),
  CONSTRAINT `coverage_zones_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `coverage_zones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coverage_zones`
--

LOCK TABLES `coverage_zones` WRITE;
/*!40000 ALTER TABLE `coverage_zones` DISABLE KEYS */;
/*!40000 ALTER TABLE `coverage_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_wallet_transactions`
--

DROP TABLE IF EXISTS `credit_wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_wallet_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `credit_wallet_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('credit','debit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` enum('refund','overpayment','promotional','invoice_payment','manual_adjustment','proration_credit','referral_bonus') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_before` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `invoice_id` bigint unsigned DEFAULT NULL,
  `payment_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `credit_wallet_transactions_invoice_id_foreign` (`invoice_id`),
  KEY `credit_wallet_transactions_payment_id_foreign` (`payment_id`),
  KEY `credit_wallet_transactions_created_by_foreign` (`created_by`),
  KEY `credit_wallet_transactions_credit_wallet_id_index` (`credit_wallet_id`),
  KEY `credit_wallet_transactions_user_id_index` (`user_id`),
  CONSTRAINT `credit_wallet_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `credit_wallet_transactions_credit_wallet_id_foreign` FOREIGN KEY (`credit_wallet_id`) REFERENCES `credit_wallets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `credit_wallet_transactions_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `credit_wallet_transactions_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `credit_wallet_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_wallet_transactions`
--

LOCK TABLES `credit_wallet_transactions` WRITE;
/*!40000 ALTER TABLE `credit_wallet_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `credit_wallet_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_wallets`
--

DROP TABLE IF EXISTS `credit_wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_wallets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_credited` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_debited` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `credit_wallets_user_id_foreign` (`user_id`),
  CONSTRAINT `credit_wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_wallets`
--

LOCK TABLES `credit_wallets` WRITE;
/*!40000 ALTER TABLE `credit_wallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `credit_wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq_categories`
--

DROP TABLE IF EXISTS `faq_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faq_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faq_categories_slug_unique` (`slug`),
  KEY `faq_categories_order_index` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq_categories`
--

LOCK TABLES `faq_categories` WRITE;
/*!40000 ALTER TABLE `faq_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `faq_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `views` int NOT NULL DEFAULT '0',
  `created_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faqs_created_by_foreign` (`created_by`),
  KEY `faqs_category_id_is_active_order_index` (`category_id`,`is_active`,`order`),
  CONSTRAINT `faqs_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `faq_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `faqs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `addon_id` bigint unsigned DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `type` enum('plan','addon','setup_fee','proration','credit','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'plan',
  `metadata` json DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_items_product_id_foreign` (`product_id`),
  KEY `invoice_items_addon_id_foreign` (`addon_id`),
  KEY `invoice_items_invoice_id_index` (`invoice_id`),
  CONSTRAINT `invoice_items_addon_id_foreign` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoice_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `subscription_id` bigint unsigned DEFAULT NULL,
  `invoice_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('subscription','one_time','prorated','credit_note','setup_fee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'subscription',
  `status` enum('draft','sent','paid','partial','overdue','void','refunded','uncollectible') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `billing_period_start` date DEFAULT NULL,
  `billing_period_end` date DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date NOT NULL,
  `paid_at` date DEFAULT NULL,
  `voided_at` date DEFAULT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `setup_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount_due` decimal(10,2) NOT NULL DEFAULT '0.00',
  `credit_applied` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `tax_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `discount_reason` text COLLATE utf8mb4_unicode_ci,
  `original_invoice_id` bigint unsigned DEFAULT NULL,
  `credit_note_amount` decimal(10,2) DEFAULT NULL,
  `reminder_count` int NOT NULL DEFAULT '0',
  `last_reminder_sent_at` timestamp NULL DEFAULT NULL,
  `reminders_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `pdf_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pdf_generated_at` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  KEY `invoices_original_invoice_id_foreign` (`original_invoice_id`),
  KEY `invoices_created_by_foreign` (`created_by`),
  KEY `invoices_user_id_index` (`user_id`),
  KEY `invoices_subscription_id_index` (`subscription_id`),
  KEY `invoices_status_index` (`status`),
  KEY `invoices_type_index` (`type`),
  KEY `invoices_due_date_index` (`due_date`),
  KEY `invoices_invoice_number_index` (`invoice_number`),
  KEY `invoices_invoice_date_index` (`invoice_date`),
  CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_original_invoice_id_foreign` FOREIGN KEY (`original_invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_histories`
--

DROP TABLE IF EXISTS `login_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('success','failed','blocked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'success',
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logged_in_at` timestamp NULL DEFAULT NULL,
  `logged_out_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `login_histories_user_id_index` (`user_id`),
  KEY `login_histories_email_index` (`email`),
  KEY `login_histories_status_index` (`status`),
  KEY `login_histories_logged_in_at_index` (`logged_in_at`),
  CONSTRAINT `login_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_histories`
--

LOCK TABLES `login_histories` WRITE;
/*!40000 ALTER TABLE `login_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `folder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `usage_count` int NOT NULL DEFAULT '0',
  `created_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_created_by_foreign` (`created_by`),
  KEY `media_folder_created_at_index` (`folder`,`created_at`),
  KEY `media_mime_type_index` (`mime_type`),
  CONSTRAINT `media_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_01_01_000001_create_login_histories_table',1),(5,'2024_01_01_000002_create_user_activities_table',1),(6,'2024_01_01_000003_create_permission_tables',1),(7,'2024_01_01_000004_create_personal_access_tokens_table',1),(8,'2024_01_01_000005_create_categories_table',1),(9,'2024_01_01_000006_create_products_table',1),(10,'2024_01_01_000007_create_product_variants_table',1),(11,'2024_01_01_000008_create_addons_table',1),(12,'2024_01_01_000009_create_product_addon_table',1),(13,'2024_01_01_000010_create_media_table',1),(14,'2024_01_01_000011_create_banners_table',1),(15,'2024_01_01_000012_create_testimonials_table',1),(16,'2024_01_01_000013_create_faqs_table',1),(17,'2024_01_01_000014_create_coverage_zones_table',1),(18,'2024_01_01_000016_create_coverage_zone_packages_table',1),(19,'2024_01_01_000017_create_product_coverage_zones_table',1),(20,'2024_01_01_000019_create_coverage_interest_signups_table',1),(21,'2024_01_01_000020_create_address_check_logs_table',1),(22,'2024_01_01_000021_create_subscriptions_table',1),(23,'2024_01_01_000022_create_subscription_addons_table',1),(24,'2024_01_01_000023_create_subscription_plan_changes_table',1),(25,'2024_01_01_000024_create_subscription_status_history_table',1),(26,'2024_01_01_000025_create_subscription_reminders_table',1),(27,'2024_01_01_000026_create_staff_invitations_table',1),(28,'2024_01_01_000027_create_quote_requests_table',1),(29,'2026_02_26_165902_create_invoices_table',1),(30,'2026_02_26_170212_create_invoice_items_table',1),(31,'2026_02_26_171842_create_payments_table',1),(32,'2026_02_26_171929_create_credit_wallets_table',1),(33,'2026_02_26_172015_create_credit_wallet_transactions_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_permissions`
--

LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_roles`
--

LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES (3,'App\\Models\\User',1),(2,'App\\Models\\User',2);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned DEFAULT NULL,
  `subscription_id` bigint unsigned DEFAULT NULL,
  `payment_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('mpesa','card','bank_transfer','cash','cheque','wallet','pesapal','flutterwave','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gateway` enum('mpesa_stk','mpesa_paybill','mpesa_c2b','pesapal','flutterwave','stripe','manual','wallet','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `status` enum('pending','processing','completed','failed','cancelled','refunded','partial_refund','disputed','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `amount` decimal(10,2) NOT NULL,
  `gateway_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `net_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `refunded_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `mpesa_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mpesa_receipt_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mpesa_checkout_request_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mpesa_merchant_request_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mpesa_account_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_last_four` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_holder_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_date` date DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refunded_by` bigint unsigned DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `refund_reason` text COLLATE utf8mb4_unicode_ci,
  `refund_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `recorded_by` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_payment_number_unique` (`payment_number`),
  UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  KEY `payments_refunded_by_foreign` (`refunded_by`),
  KEY `payments_recorded_by_foreign` (`recorded_by`),
  KEY `payments_user_id_index` (`user_id`),
  KEY `payments_invoice_id_index` (`invoice_id`),
  KEY `payments_subscription_id_index` (`subscription_id`),
  KEY `payments_status_index` (`status`),
  KEY `payments_payment_method_index` (`payment_method`),
  KEY `payments_gateway_index` (`gateway`),
  KEY `payments_transaction_id_index` (`transaction_id`),
  KEY `payments_mpesa_receipt_number_index` (`mpesa_receipt_number`),
  KEY `payments_mpesa_checkout_request_id_index` (`mpesa_checkout_request_id`),
  KEY `payments_payment_number_index` (`payment_number`),
  KEY `payments_paid_at_index` (`paid_at`),
  CONSTRAINT `payments_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_refunded_by_foreign` FOREIGN KEY (`refunded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'users.view','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(2,'users.view.own','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(3,'users.view.clients','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(4,'users.view.staff','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(5,'users.view.all','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(6,'users.create','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(7,'users.edit.own','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(8,'users.edit.clients','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(9,'users.edit.staff','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(10,'users.edit.all','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(11,'users.delete','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(12,'users.suspend','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(13,'users.activate','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(14,'users.impersonate','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(15,'roles.view','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(16,'roles.create','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(17,'roles.edit','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(18,'roles.delete','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(19,'permissions.view','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(20,'permissions.assign','web','2026-03-07 08:11:05','2026-03-07 08:11:05'),(21,'categories.view','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(22,'categories.create','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(23,'categories.edit','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(24,'categories.delete','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(25,'products.view','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(26,'products.view.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(27,'products.create','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(28,'products.edit','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(29,'products.delete','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(30,'products.manage.pricing','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(31,'products.manage.features','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(32,'subscriptions.view.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(33,'subscriptions.view.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(34,'subscriptions.create','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(35,'subscriptions.edit.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(36,'subscriptions.edit.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(37,'subscriptions.cancel.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(38,'subscriptions.cancel.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(39,'subscriptions.suspend','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(40,'subscriptions.activate','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(41,'subscriptions.upgrade','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(42,'subscriptions.downgrade','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(43,'invoices.view.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(44,'invoices.view.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(45,'invoices.create','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(46,'invoices.edit','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(47,'invoices.delete','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(48,'invoices.send','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(49,'invoices.mark.paid','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(50,'invoices.void','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(51,'invoices.download','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(52,'payments.view.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(53,'payments.view.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(54,'payments.process','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(55,'payments.refund','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(56,'payments.verify','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(57,'tickets.view.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(58,'tickets.view.assigned','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(59,'tickets.view.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(60,'tickets.create','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(61,'tickets.edit.own','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(62,'tickets.edit.all','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(63,'tickets.delete','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(64,'tickets.assign','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(65,'tickets.resolve','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(66,'tickets.close','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(67,'tickets.reopen','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(68,'tickets.internal.notes','web','2026-03-07 08:11:06','2026-03-07 08:11:06'),(69,'media.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(70,'media.upload','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(71,'media.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(72,'media.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(73,'banners.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(74,'banners.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(75,'banners.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(76,'banners.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(77,'testimonials.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(78,'testimonials.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(79,'testimonials.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(80,'testimonials.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(81,'testimonials.approve','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(82,'testimonials.reject','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(83,'faqs.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(84,'faqs.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(85,'faqs.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(86,'faqs.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(87,'kb.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(88,'kb.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(89,'kb.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(90,'kb.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(91,'kb.publish','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(92,'coverage.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(93,'coverage.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(94,'coverage.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(95,'coverage.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(96,'coverage.check','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(97,'pages.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(98,'pages.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(99,'pages.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(100,'pages.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(101,'pages.publish','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(102,'blog.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(103,'blog.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(104,'blog.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(105,'blog.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(106,'blog.publish','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(107,'hosting.view.own','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(108,'hosting.view.all','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(109,'hosting.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(110,'hosting.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(111,'hosting.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(112,'hosting.suspend','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(113,'hosting.manage.packages','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(114,'domains.view.own','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(115,'domains.view.all','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(116,'domains.register','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(117,'domains.transfer','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(118,'domains.renew','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(119,'portfolio.view','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(120,'portfolio.create','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(121,'portfolio.edit','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(122,'portfolio.delete','web','2026-03-07 08:11:07','2026-03-07 08:11:07'),(123,'settings.view','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(124,'settings.edit','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(125,'settings.email.templates','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(126,'settings.system','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(127,'reports.view','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(128,'reports.revenue','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(129,'reports.subscriptions','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(130,'reports.tickets','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(131,'reports.export','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(132,'analytics.view','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(133,'analytics.clients','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(134,'analytics.staff','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(135,'audit.view','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(136,'audit.delete','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(137,'notifications.view.own','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(138,'notifications.send','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(139,'notifications.manage.templates','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(140,'dashboard.client','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(141,'dashboard.staff','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(142,'dashboard.admin','web','2026-03-07 08:11:08','2026-03-07 08:11:08');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_addon`
--

DROP TABLE IF EXISTS `product_addon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_addon` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `addon_id` bigint unsigned NOT NULL,
  `custom_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '0',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_addon_product_id_addon_id_unique` (`product_id`,`addon_id`),
  KEY `product_addon_addon_id_foreign` (`addon_id`),
  KEY `product_addon_product_id_addon_id_index` (`product_id`,`addon_id`),
  CONSTRAINT `product_addon_addon_id_foreign` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_addon_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_addon`
--

LOCK TABLES `product_addon` WRITE;
/*!40000 ALTER TABLE `product_addon` DISABLE KEYS */;
INSERT INTO `product_addon` VALUES (1,1,1,500.00,NULL,0,0,1,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(2,1,3,2000.00,NULL,0,0,2,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(3,2,1,500.00,NULL,0,0,1,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(4,2,3,2000.00,NULL,0,0,2,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(5,3,1,500.00,NULL,0,0,1,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(6,3,2,5000.00,NULL,0,0,2,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(7,4,1,500.00,NULL,0,0,1,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(8,4,2,4500.00,NULL,0,0,2,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(9,4,7,1500.00,NULL,0,0,3,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(10,5,1,0.00,NULL,0,1,1,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(11,5,2,4000.00,NULL,0,0,2,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(12,5,7,0.00,NULL,0,1,3,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(13,12,5,500.00,NULL,0,0,1,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(14,12,6,1000.00,NULL,0,0,2,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(15,15,5,500.00,NULL,0,0,1,'2026-03-07 08:11:10','2026-03-07 08:11:10');
/*!40000 ALTER TABLE `product_addon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_coverage_zones`
--

DROP TABLE IF EXISTS `product_coverage_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_coverage_zones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `coverage_zone_id` bigint unsigned NOT NULL,
  `price_monthly` decimal(10,2) DEFAULT NULL,
  `price_quarterly` decimal(10,2) DEFAULT NULL,
  `price_semi_annually` decimal(10,2) DEFAULT NULL,
  `price_annually` decimal(10,2) DEFAULT NULL,
  `price_one_time` decimal(10,2) DEFAULT NULL,
  `setup_fee` decimal(10,2) DEFAULT NULL,
  `promotional_price` decimal(10,2) DEFAULT NULL,
  `promotional_start` timestamp NULL DEFAULT NULL,
  `promotional_end` timestamp NULL DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `capacity_limit` int DEFAULT NULL,
  `current_capacity` int NOT NULL DEFAULT '0',
  `speed_mbps` int DEFAULT NULL,
  `connection_type` enum('fiber','wireless','both') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_coverage_zones_product_id_coverage_zone_id_unique` (`product_id`,`coverage_zone_id`),
  KEY `product_coverage_zones_product_id_index` (`product_id`),
  KEY `product_coverage_zones_coverage_zone_id_index` (`coverage_zone_id`),
  KEY `product_coverage_zones_is_available_index` (`is_available`),
  CONSTRAINT `product_coverage_zones_coverage_zone_id_foreign` FOREIGN KEY (`coverage_zone_id`) REFERENCES `coverage_zones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_coverage_zones_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_coverage_zones`
--

LOCK TABLES `product_coverage_zones` WRITE;
/*!40000 ALTER TABLE `product_coverage_zones` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_coverage_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attributes` json DEFAULT NULL,
  `price_monthly` decimal(10,2) DEFAULT NULL,
  `price_quarterly` decimal(10,2) DEFAULT NULL,
  `price_semi_annually` decimal(10,2) DEFAULT NULL,
  `price_annually` decimal(10,2) DEFAULT NULL,
  `price_one_time` decimal(10,2) DEFAULT NULL,
  `setup_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_quantity` int DEFAULT NULL,
  `capacity_limit` int DEFAULT NULL,
  `current_capacity` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_variants_sku_unique` (`sku`),
  KEY `product_variants_product_id_index` (`product_id`),
  KEY `product_variants_sku_index` (`sku`),
  KEY `product_variants_is_active_index` (`is_active`),
  CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('internet_plan','hosting_package','web_development','bulk_sms','domain','addon','service','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `speed_mbps` int DEFAULT NULL,
  `connection_type` enum('fiber','wireless','both') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan_category` enum('home','business','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_gb` int DEFAULT NULL,
  `bandwidth_gb` int DEFAULT NULL,
  `email_accounts` int DEFAULT NULL,
  `databases` int DEFAULT NULL,
  `domains_allowed` int DEFAULT NULL,
  `ssl_included` tinyint(1) NOT NULL DEFAULT '0',
  `backup_included` tinyint(1) NOT NULL DEFAULT '0',
  `pages_included` int DEFAULT NULL,
  `revisions_included` int DEFAULT NULL,
  `delivery_days` int DEFAULT NULL,
  `sms_credits` int DEFAULT NULL,
  `cost_per_sms` decimal(8,4) DEFAULT NULL,
  `price_monthly` decimal(10,2) DEFAULT NULL,
  `price_quarterly` decimal(10,2) DEFAULT NULL,
  `price_semi_annually` decimal(10,2) DEFAULT NULL,
  `price_annually` decimal(10,2) DEFAULT NULL,
  `price_one_time` decimal(10,2) DEFAULT NULL,
  `setup_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `promotional_price` decimal(10,2) DEFAULT NULL,
  `promotional_start` timestamp NULL DEFAULT NULL,
  `promotional_end` timestamp NULL DEFAULT NULL,
  `features` json DEFAULT NULL,
  `technical_specs` json DEFAULT NULL,
  `coverage_areas` json DEFAULT NULL,
  `available_nationwide` tinyint(1) NOT NULL DEFAULT '0',
  `stock_quantity` int DEFAULT NULL,
  `capacity_limit` int DEFAULT NULL,
  `current_capacity` int NOT NULL DEFAULT '0',
  `track_capacity` tinyint(1) NOT NULL DEFAULT '0',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery` json DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `requires_approval` tinyint(1) NOT NULL DEFAULT '0',
  `is_quote_based` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `terms_conditions` text COLLATE utf8mb4_unicode_ci,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `meta_keywords` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_type_index` (`type`),
  KEY `products_slug_index` (`slug`),
  KEY `products_sku_index` (`sku`),
  KEY `products_is_active_index` (`is_active`),
  KEY `products_is_featured_index` (`is_featured`),
  KEY `products_is_quote_based_index` (`is_quote_based`),
  KEY `products_speed_mbps_index` (`speed_mbps`),
  KEY `products_plan_category_index` (`plan_category`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,3,'Starter 8 Mbps','home-starter-8mbps','Perfect for light internet users who need basic connectivity for browsing, email, and standard definition streaming. Ideal for 1-2 users.','Perfect for light browsing and email','HOME-STARTER-8','internet_plan',8,'fiber','home',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"Unlimited internet access\", \"Moderate internet speed\", \"SD Movie & Music Streaming\", \"Fast web browsing\", \"SD TV programming\", \"E-learning & Online meetings\"]','{\"Contract\": \"12 months\", \"Data Cap\": \"Unlimited\", \"Technology\": \"Fiber to the Home (FTTH)\", \"Upload Speed\": \"4 Mbps\", \"Download Speed\": \"8 Mbps\"}','[\"Nairobi\", \"Kiambu\", \"Machakos\"]',0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,1,NULL,NULL,'Home Starter 8Mbps - Affordable Fiber Internet | Vilcom Networks','Get affordable fiber internet at KES 1,999/month with unlimited data. Perfect for light browsing, SD streaming, and e-learning.',NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(2,3,'Starter 18 Mbps','home-starter-18mbps','A step up for households needing slightly more speed for comfortable SD streaming, browsing, and online meetings on multiple devices.','Reliable speed for everyday internet use','HOME-STARTER-18','internet_plan',18,'fiber','home',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,2799.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"Unlimited internet access\", \"Moderate internet speed\", \"SD Movie & Music Streaming\", \"Fast web browsing\", \"SD TV programming\", \"E-learning & Online meetings\"]','{\"Contract\": \"12 months\", \"Data Cap\": \"Unlimited\", \"Technology\": \"Fiber to the Home (FTTH)\", \"Upload Speed\": \"9 Mbps\", \"Download Speed\": \"18 Mbps\"}','[\"Nairobi\", \"Kiambu\", \"Machakos\"]',0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,2,NULL,NULL,'Home Starter 18Mbps - Fiber Internet | Vilcom Networks','Enjoy reliable fiber internet at KES 2,799/month. Great for SD streaming, browsing, and online meetings.',NULL,NULL,'2026-03-07 08:11:09','2026-03-07 08:11:09'),(3,3,'Basic 30 Mbps','home-basic-30mbps','High-speed internet for families who enjoy HD streaming, e-learning, and online meetings simultaneously on multiple devices.','High speed for HD streaming and e-learning','HOME-BASIC-30','internet_plan',30,'fiber','home',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,3799.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"High speed internet\", \"Fast web browsing\", \"SD Movie and Music streaming\", \"HD TV Programming\", \"E-Learning\", \"Online meetings\"]','{\"Contract\": \"12 months\", \"Data Cap\": \"Unlimited\", \"Technology\": \"Fiber to the Home (FTTH)\", \"Upload Speed\": \"15 Mbps\", \"Download Speed\": \"30 Mbps\"}','[\"Nairobi\", \"Kiambu\", \"Machakos\", \"Nakuru\"]',0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,3,NULL,NULL,'Home Basic 30Mbps - High Speed Fiber | Vilcom Networks','High-speed fiber internet at KES 3,799/month. Perfect for HD TV programming, e-learning, and online meetings.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(4,3,'Basic 60 Mbps','home-basic-60mbps','Great for connected families with multiple devices enjoying HD content, online meetings, and e-learning all at once.','High speed for the whole family','HOME-BASIC-60','internet_plan',60,'fiber','home',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,4999.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"High speed internet\", \"Fast web browsing\", \"SD Movie and Music streaming\", \"HD TV Programming\", \"E-Learning\", \"Online meetings\"]','{\"Contract\": \"12 months\", \"Data Cap\": \"Unlimited\", \"Technology\": \"Fiber to the Home (FTTH)\", \"Upload Speed\": \"30 Mbps\", \"Download Speed\": \"60 Mbps\"}','[\"Nairobi\", \"Kiambu\", \"Machakos\", \"Nakuru\", \"Kisumu\", \"Mombasa\"]',0,NULL,NULL,0,0,NULL,NULL,NULL,'Best Value',1,1,0,0,4,NULL,NULL,'Home Basic 60Mbps - High Speed Fiber | Vilcom Networks','High-speed fiber internet at KES 4,999/month. HD TV, e-learning and online meetings for the whole family.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(5,3,'Standard 100 Mbps','home-standard-100mbps','Our premium home plan with blazing speeds for power users, streamers, and large families. Perfect for 4K streaming, live gaming, and superfast downloads.','Ultimate speed for power users and gamers','HOME-STANDARD-100','internet_plan',100,'fiber','home',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,7999.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"SD Movie & Music streaming\", \"HD TV Programming\", \"Multiple Device Streaming\", \"Superfast Video Downloads\", \"Live Video Coverage\", \"Online Gaming\"]','{\"Contract\": \"12 months\", \"Data Cap\": \"Unlimited\", \"Technology\": \"Fiber to the Home (FTTH)\", \"Upload Speed\": \"50 Mbps\", \"Download Speed\": \"100 Mbps\"}','[\"Nairobi\", \"Kiambu\", \"Machakos\", \"Nakuru\", \"Kisumu\", \"Mombasa\", \"Eldoret\"]',0,NULL,NULL,0,0,NULL,NULL,NULL,'Premium',1,1,0,0,5,NULL,NULL,'Home Standard 100Mbps - Premium Fiber Internet | Vilcom Networks','Premium fiber internet at KES 7,999/month. HD streaming, online gaming, live video and superfast downloads.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(6,5,'Business Fiber 40 Mbps','business-fiber-40mbps','Dedicated fiber connectivity for small businesses. Enjoy consistent 40 Mbps speeds with guaranteed uptime and business-grade support.','Dedicated connectivity for small businesses','BIZ-FIBER-40','internet_plan',40,'fiber','business',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,4999.00,NULL,NULL,NULL,NULL,5000.00,NULL,NULL,NULL,'[\"Dedicated 40 Mbps bandwidth\", \"Unlimited business data\", \"Static IP address included\", \"SLA uptime guarantee\", \"Business hours support\", \"Priority installation\"]','{\"SLA\": \"99.5% uptime\", \"Technology\": \"Fiber to the Business (FTTB)\", \"Installation\": \"24 hours\", \"Upload Speed\": \"20 Mbps dedicated\", \"Download Speed\": \"40 Mbps dedicated\", \"Contention Ratio\": \"1:1 dedicated\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,1,'Business registration documents, ID/Passport, Lease/Ownership documents','24-month business contract required',NULL,NULL,NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(7,5,'Business Fiber 80 Mbps','business-fiber-80mbps','Dedicated 80 Mbps fiber for growing businesses. Reliable, high-performance connectivity for teams of up to 20 employees.','Dedicated speed for growing teams','BIZ-FIBER-80','internet_plan',80,'fiber','business',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,6999.00,NULL,NULL,NULL,NULL,5000.00,NULL,NULL,NULL,'[\"Dedicated 80 Mbps bandwidth\", \"Unlimited business data\", \"Static IP address included\", \"SLA uptime guarantee\", \"Priority business support\", \"Priority installation\"]','{\"SLA\": \"99.5% uptime\", \"Technology\": \"Fiber to the Business (FTTB)\", \"Installation\": \"24 hours\", \"Upload Speed\": \"40 Mbps dedicated\", \"Download Speed\": \"80 Mbps dedicated\", \"Contention Ratio\": \"1:1 dedicated\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,2,'Business registration documents, ID/Passport, Lease/Ownership documents','24-month business contract required',NULL,NULL,NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(8,5,'Business Fiber 120 Mbps','business-fiber-120mbps','High-performance dedicated fiber for established businesses. Supports cloud operations, video conferencing, and multiple simultaneous users.','High performance for established businesses','BIZ-FIBER-120','internet_plan',120,'fiber','business',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,12999.00,NULL,NULL,NULL,NULL,7500.00,NULL,NULL,NULL,'[\"Dedicated 120 Mbps bandwidth\", \"Unlimited business data\", \"Multiple static IPs\", \"SLA 99.9% uptime guarantee\", \"24/7 priority support\", \"Dedicated account manager\", \"DDoS protection\"]','{\"SLA\": \"99.9% uptime\", \"Support\": \"24/7 priority\", \"Technology\": \"Fiber to the Business (FTTB)\", \"Installation\": \"12-24 hours\", \"Upload Speed\": \"60 Mbps dedicated\", \"Download Speed\": \"120 Mbps dedicated\", \"Contention Ratio\": \"1:1 dedicated\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,'Most Popular',1,1,0,0,3,'Business registration documents, ID/Passport, Lease/Ownership documents','24-month business contract required',NULL,NULL,NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(9,5,'Business Fiber 200 Mbps','business-fiber-200mbps','Dedicated 200 Mbps fiber for large businesses and organisations with high bandwidth demands and mission-critical operations.','Dedicated bandwidth for large organisations','BIZ-FIBER-200','internet_plan',200,'fiber','business',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,20999.00,NULL,NULL,NULL,NULL,10000.00,NULL,NULL,NULL,'[\"Dedicated 200 Mbps bandwidth\", \"Unlimited business data\", \"IP block included\", \"SLA 99.9% uptime guarantee\", \"24/7 VIP support\", \"Dedicated account manager\", \"Advanced DDoS protection\", \"Redundant connectivity option\"]','{\"SLA\": \"99.9% uptime\", \"Support\": \"24/7 VIP\", \"Technology\": \"Fiber to the Business (FTTB)\", \"Installation\": \"12-24 hours\", \"Upload Speed\": \"100 Mbps dedicated\", \"Download Speed\": \"200 Mbps dedicated\", \"Contention Ratio\": \"1:1 dedicated\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,4,'Business registration documents, ID/Passport, Lease/Ownership documents','24-month business contract required',NULL,NULL,NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(10,5,'Business Fiber 300 Mbps','business-fiber-300mbps','Enterprise-grade dedicated 300 Mbps fiber for organisations with intensive bandwidth requirements and zero tolerance for downtime.','Enterprise-grade dedicated connectivity','BIZ-FIBER-300','internet_plan',300,'fiber','enterprise',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,29999.00,NULL,NULL,NULL,NULL,12500.00,NULL,NULL,NULL,'[\"Dedicated 300 Mbps bandwidth\", \"Unlimited business data\", \"Large IP block included\", \"SLA 99.99% uptime guarantee\", \"24/7 VIP support with on-site option\", \"Advanced DDoS protection\", \"Redundant connections available\", \"Custom network solutions\"]','{\"SLA\": \"99.99% uptime\", \"Support\": \"24/7 VIP + on-site\", \"Technology\": \"Fiber to the Business (FTTB)\", \"Installation\": \"Priority 6-12 hours\", \"Upload Speed\": \"150 Mbps dedicated\", \"Download Speed\": \"300 Mbps dedicated\", \"Contention Ratio\": \"1:1 dedicated\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,'Enterprise',1,0,0,0,5,'Business registration documents, ID/Passport, Lease/Ownership documents','24-month business contract required',NULL,NULL,NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(11,5,'Business Fiber 500 Mbps','business-fiber-500mbps','Maximum-performance dedicated 500 Mbps fiber for the most demanding enterprise environments requiring top-tier bandwidth and reliability.','Maximum dedicated bandwidth for enterprise','BIZ-FIBER-500','internet_plan',500,'fiber','enterprise',NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,38999.00,NULL,NULL,NULL,NULL,15000.00,NULL,NULL,NULL,'[\"Dedicated 500 Mbps bandwidth\", \"Unlimited business data\", \"Large IP block (/28 network)\", \"SLA 99.99% uptime guarantee\", \"24/7 VIP support with on-site\", \"Advanced DDoS protection\", \"Redundant connections included\", \"Custom network solutions\", \"On-site support available\"]','{\"SLA\": \"99.99% uptime\", \"Support\": \"24/7 VIP + on-site\", \"IP Block\": \"/28 network (16 IPs)\", \"Technology\": \"Fiber to the Business (FTTB)\", \"Installation\": \"Priority 6-12 hours\", \"Upload Speed\": \"250 Mbps dedicated\", \"Download Speed\": \"500 Mbps dedicated\", \"Contention Ratio\": \"1:1 dedicated\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,'Enterprise',1,0,0,0,6,'Business registration documents, ID/Passport, Lease/Ownership documents','24-month business contract required',NULL,NULL,NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(12,9,'Starter Plan','web-hosting-starter','Perfect entry-level hosting for personal websites, blogs, and small portfolios. Includes everything you need to get started online including a free .co.ke domain.','Perfect for personal websites and blogs','WEB-STARTER','hosting_package',NULL,NULL,NULL,35,999999,999999,999999,1,1,0,NULL,NULL,NULL,NULL,NULL,375.00,NULL,NULL,4500.00,NULL,0.00,NULL,NULL,NULL,'[\"35GB NVMe SSD Disk Space\", \"2GB RAM\", \"Suitable for Starters\", \"Free .co.ke domain\", \"Free Site Building Tools\", \"SEO-Friendly Hosting\", \"Unlimited Email Accounts\", \"Unlimited Monthly Bandwidth\", \"Unlimited Sub-Domains\", \"FREE SSL Certificate\", \"FREE Site Transfer\", \"Softaculous WordPress Manager\", \"DISCOUNTED Web Development\", \"FREE DirectAdmin\", \"PHP 8.x support\", \"FREE Instant setup\"]','{\"RAM\": \"2 GB allocated\", \"MySQL\": \"8.0\", \"Uptime\": \"99.9%\", \"Backups\": \"Weekly\", \"PHP Versions\": \"7.4, 8.0, 8.1, 8.2, 8.3\", \"Storage Size\": \"35 GB\", \"Storage Type\": \"NVMe SSD\", \"Control Panel\": \"DirectAdmin\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,1,NULL,NULL,'Starter Hosting Plan - KES 4,500/Year | Vilcom Networks','Affordable hosting at KES 4,500/year with 35GB NVMe SSD, free .co.ke domain, free SSL and instant setup.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(13,9,'Standard Plan','web-hosting-standard','Our most popular hosting plan for SAAS websites and small businesses. 100GB NVMe SSD, 4GB RAM, and all the tools you need.','Most popular for SAAS and small business sites','WEB-STANDARD','hosting_package',NULL,NULL,NULL,100,999999,999999,999999,5,1,1,NULL,NULL,NULL,NULL,NULL,458.00,NULL,NULL,5500.00,NULL,0.00,NULL,NULL,NULL,'[\"100GB NVMe SSD Disk Space\", \"4GB RAM\", \"Suitable for SAAS Websites\", \"Free Site Building Tools\", \"SEO-Friendly Hosting\", \"Unlimited Email Accounts\", \"Unlimited Monthly Bandwidth\", \"Unlimited Sub-Domains\", \"FREE SSL Certificate\", \"FREE Site Transfer\", \"Softaculous WordPress Manager\", \"DISCOUNTED Web Development\", \"FREE DirectAdmin\", \"PHP 8.x support\", \"FREE Instant setup\"]','{\"RAM\": \"4 GB allocated\", \"MySQL\": \"8.0\", \"Uptime\": \"99.9%\", \"Backups\": \"Daily\", \"PHP Versions\": \"7.4, 8.0, 8.1, 8.2, 8.3\", \"Storage Size\": \"100 GB\", \"Storage Type\": \"NVMe SSD\", \"Control Panel\": \"DirectAdmin\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,'Best Value',1,1,0,0,2,NULL,NULL,'Standard Hosting Plan - KES 5,500/Year | Vilcom Networks','Popular hosting at KES 5,500/year with 100GB NVMe SSD, 4GB RAM, free SSL, and daily backups.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(14,9,'Executive Plan','web-hosting-executive','Premium hosting for mission-critical websites requiring maximum performance. Unlimited NVMe SSD storage and 8GB RAM.','Premium hosting for mission-critical websites','WEB-EXECUTIVE','hosting_package',NULL,NULL,NULL,999999,999999,999999,999999,999999,1,1,NULL,NULL,NULL,NULL,NULL,1067.00,NULL,NULL,12800.00,NULL,0.00,NULL,NULL,NULL,'[\"Unlimited NVMe SSD Disk Space\", \"8GB RAM\", \"Suitable for Mission Critical Websites\", \"Free Site Building Tools\", \"SEO-Friendly Hosting\", \"Unlimited Email Accounts\", \"Unlimited Monthly Bandwidth\", \"Unlimited Sub-Domains\", \"FREE SSL Certificate\", \"FREE Site Transfer\", \"Softaculous WordPress Manager\", \"DISCOUNTED Web Development\", \"FREE DirectAdmin\", \"PHP 8.x support\", \"FREE Instant setup\"]','{\"RAM\": \"8 GB allocated\", \"MySQL\": \"8.0\", \"Uptime\": \"99.99%\", \"Backups\": \"Daily\", \"PHP Versions\": \"7.4, 8.0, 8.1, 8.2, 8.3\", \"Storage Size\": \"Unlimited\", \"Storage Type\": \"NVMe SSD\", \"Control Panel\": \"DirectAdmin\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,3,NULL,NULL,'Executive Hosting Plan - KES 12,800/Year | Vilcom Networks','Mission-critical hosting at KES 12,800/year with unlimited NVMe SSD, 8GB RAM, and free SSL.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(15,9,'Hosting Only Plan','web-hosting-only','No-frills hosting for those who already have a domain. Same great NVMe SSD hosting and tools without the included domain.','Great hosting without a free domain','WEB-HOSTING-ONLY','hosting_package',NULL,NULL,NULL,35,999999,999999,999999,1,1,0,NULL,NULL,NULL,NULL,NULL,250.00,NULL,NULL,2999.00,NULL,0.00,NULL,NULL,NULL,'[\"35GB NVMe SSD Disk Space\", \"2GB RAM\", \"Suitable for Starters\", \"SEO-Friendly Hosting\", \"Unlimited Email Accounts\", \"Unlimited Monthly Bandwidth\", \"Unlimited Sub-Domains\", \"FREE SSL Certificate\", \"FREE Site Transfer\", \"Softaculous WordPress Manager\", \"DISCOUNTED Web Development\", \"FREE DirectAdmin\", \"PHP 8.x support\", \"FREE Instant setup\"]','{\"RAM\": \"2 GB allocated\", \"MySQL\": \"8.0\", \"Domain\": \"Bring your own (not included)\", \"Uptime\": \"99.9%\", \"Backups\": \"Weekly\", \"PHP Versions\": \"7.4, 8.0, 8.1, 8.2, 8.3\", \"Storage Size\": \"35 GB\", \"Storage Type\": \"NVMe SSD\", \"Control Panel\": \"DirectAdmin\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,4,NULL,NULL,'Hosting Only Plan - KES 2,999/Year | Vilcom Networks','Budget hosting at KES 2,999/year with 35GB NVMe SSD, free SSL. Bring your own domain.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(16,10,'Basic VPS','vps-basic','Entry-level VPS for developers, small applications, and websites that have outgrown shared hosting. Full root access with 1 core and 2GB RAM.','Entry-level virtual private server','VPS-BASIC','hosting_package',NULL,NULL,NULL,20,999999,999999,999999,999999,1,0,NULL,NULL,NULL,NULL,NULL,2000.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"1 Core CPU\", \"2 GB Guaranteed RAM\", \"20GB 100% SSD Disk Space\", \"KVM Virtualization\", \"Unlimited Bandwidth\", \"Full Root Access\", \"DDoS Protection\", \"200 Mbit/s Port\", \"FREE cPanel License (5 cPanel accounts)\", \"1 IPv4 Address\", \"64 Network IPv6 Address\"]','{\"CPU\": \"1 Core Dedicated\", \"RAM\": \"2 GB Guaranteed\", \"IPv4\": \"1 Address\", \"IPv6\": \"64 Addresses\", \"Storage\": \"20 GB SSD\", \"Bandwidth\": \"Unlimited\", \"Port Speed\": \"200 Mbit/s\", \"Control Panel\": \"cPanel (5 accounts)\", \"Virtualization\": \"KVM\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,1,NULL,NULL,'Basic VPS - KES 2,000/Month | Vilcom Networks','Entry-level VPS hosting at KES 2,000/month. 1 Core, 2GB RAM, 20GB SSD, full root access and DDoS protection.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(17,10,'Advanced VPS','vps-advanced','Balanced VPS for growing applications and development environments. 2 cores and 8GB RAM for smooth, reliable performance.','Balanced performance for growing applications','VPS-ADVANCED','hosting_package',NULL,NULL,NULL,80,999999,999999,999999,999999,1,1,NULL,NULL,NULL,NULL,NULL,4000.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"2 Cores CPU\", \"8 GB Guaranteed RAM\", \"80GB 100% SSD Disk Space\", \"KVM Virtualization\", \"Unlimited Bandwidth\", \"Full Root Access\", \"DDoS Protection\", \"400 Mbit/s Port\", \"FREE cPanel License (5 cPanel accounts)\", \"1 IPv4 Address\", \"64 Network IPv6 Address\"]','{\"CPU\": \"2 Cores Dedicated\", \"RAM\": \"8 GB Guaranteed\", \"IPv4\": \"1 Address\", \"IPv6\": \"64 Addresses\", \"Storage\": \"80 GB SSD\", \"Bandwidth\": \"Unlimited\", \"Port Speed\": \"400 Mbit/s\", \"Control Panel\": \"cPanel (5 accounts)\", \"Virtualization\": \"KVM\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,'Popular',1,1,0,0,2,NULL,NULL,'Advanced VPS - KES 4,000/Month | Vilcom Networks','Advanced VPS hosting at KES 4,000/month. 2 Cores, 8GB RAM, 80GB SSD, full root access.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(18,10,'Business VPS','vps-business','High-performance VPS with premium resources for demanding applications and high-traffic production environments. 4 cores and 16GB RAM.','High-performance VPS for demanding workloads','VPS-BUSINESS','hosting_package',NULL,NULL,NULL,160,999999,999999,999999,999999,1,1,NULL,NULL,NULL,NULL,NULL,6000.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"4 Cores CPU\", \"16 GB Guaranteed RAM\", \"160GB 100% SSD Disk Space\", \"KVM Virtualization\", \"Unlimited Bandwidth\", \"Full Root Access\", \"DDoS Protection\", \"600 Mbit/s Port\", \"FREE cPanel License (5 cPanel accounts)\", \"1 IPv4 Address\", \"64 Network IPv6 Address\"]','{\"CPU\": \"4 Cores Dedicated\", \"RAM\": \"16 GB Guaranteed\", \"IPv4\": \"1 Address\", \"IPv6\": \"64 Addresses\", \"Storage\": \"160 GB SSD\", \"Bandwidth\": \"Unlimited\", \"OS Options\": \"Ubuntu, CentOS, Debian, AlmaLinux\", \"Port Speed\": \"600 Mbit/s\", \"Control Panel\": \"cPanel (5 accounts)\", \"Virtualization\": \"KVM\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,'Best Performance',1,0,0,0,3,NULL,NULL,'Business VPS - KES 6,000/Month | Vilcom Networks','Business VPS hosting at KES 6,000/month. 4 Cores, 16GB RAM, 160GB SSD, 600Mbit/s port.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(19,10,'Enterprise VPS','vps-enterprise','Maximum performance VPS for large-scale applications, enterprise workloads, and mission-critical services. 8 cores and 32GB RAM.','Maximum performance for enterprise workloads','VPS-ENTERPRISE','hosting_package',NULL,NULL,NULL,240,999999,999999,999999,999999,1,1,NULL,NULL,NULL,NULL,NULL,8000.00,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[\"8 Cores CPU\", \"32 GB Guaranteed RAM\", \"240GB 100% SSD Disk Space\", \"KVM Virtualization\", \"Unlimited Bandwidth\", \"Full Root Access\", \"DDoS Protection\", \"1000 Mbit/s Port\", \"FREE cPanel License (5 cPanel accounts)\", \"1 IPv4 Address\", \"64 Network IPv6 Address\"]','{\"CPU\": \"8 Cores Dedicated\", \"RAM\": \"32 GB Guaranteed\", \"IPv4\": \"1 Address\", \"IPv6\": \"64 Addresses\", \"Storage\": \"240 GB SSD\", \"Bandwidth\": \"Unlimited\", \"OS Options\": \"Ubuntu, CentOS, Debian, AlmaLinux\", \"Port Speed\": \"1000 Mbit/s (1 Gbit/s)\", \"Control Panel\": \"cPanel (5 accounts)\", \"Virtualization\": \"KVM\"}',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,4,NULL,NULL,'Enterprise VPS - KES 8,000/Month | Vilcom Networks','Enterprise VPS hosting at KES 8,000/month. 8 Cores, 32GB RAM, 240GB SSD, 1Gbit/s port.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(20,18,'.com Domain Registration','domain-com','Register the world\'s most popular .com domain. Perfect for businesses going global.','World\'s most popular domain','DOMAIN-COM','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".com Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,1,0,0,1,NULL,NULL,'.com Domain Registration | Vilcom Networks','Register the world\'s most popular .com domain. Perfect for businesses going global. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(21,18,'.net Domain Registration','domain-net','Register a professional .net domain for your network or technology business.','Professional network domain','DOMAIN-NET','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".net Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,2,NULL,NULL,'.net Domain Registration | Vilcom Networks','Register a professional .net domain for your network or technology business. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(22,18,'.org Domain Registration','domain-org','Register a .org domain for your organisation, NGO, or non-profit.','For organisations and NGOs','DOMAIN-ORG','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".org Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,3,NULL,NULL,'.org Domain Registration | Vilcom Networks','Register a .org domain for your organisation, NGO, or non-profit. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(23,18,'.biz Domain Registration','domain-biz','Register a .biz domain for your business venture.','Business domain','DOMAIN-BIZ','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".biz Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,4,NULL,NULL,'.biz Domain Registration | Vilcom Networks','Register a .biz domain for your business venture. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(24,18,'.info Domain Registration','domain-info','Register a .info domain to share information and build your knowledge portal.','Information domain','DOMAIN-INFO','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".info Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,5,NULL,NULL,'.info Domain Registration | Vilcom Networks','Register a .info domain to share information and build your knowledge portal. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(25,18,'.co.ke Domain Registration','domain-co-ke','Register your .co.ke domain for your Kenyan business. Establish your local online presence.','Kenya\'s business domain','DOMAIN-CO-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1299.00,NULL,0.00,NULL,NULL,NULL,'[\".co.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,1,0,0,6,NULL,NULL,'.co.ke Domain Registration | Vilcom Networks','Register your .co.ke domain for your Kenyan business. Establish your local online presence. Registration KES 1,299/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(26,18,'.ac.ke Domain Registration','domain-ac-ke','Register a .ac.ke domain for Kenyan academic and educational institutions.','Kenyan academic domain','DOMAIN-AC-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".ac.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,7,NULL,NULL,'.ac.ke Domain Registration | Vilcom Networks','Register a .ac.ke domain for Kenyan academic and educational institutions. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(27,18,'.or.ke Domain Registration','domain-or-ke','Register a .or.ke domain for Kenyan organisations and associations.','Kenyan organisation domain','DOMAIN-OR-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".or.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,8,NULL,NULL,'.or.ke Domain Registration | Vilcom Networks','Register a .or.ke domain for Kenyan organisations and associations. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(28,18,'.ne.ke Domain Registration','domain-ne-ke','Register a .ne.ke domain for Kenyan network service providers.','Kenyan network domain','DOMAIN-NE-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".ne.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,9,NULL,NULL,'.ne.ke Domain Registration | Vilcom Networks','Register a .ne.ke domain for Kenyan network service providers. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(29,18,'.mobi.ke Domain Registration','domain-mobi-ke','Register a .mobi.ke domain for Kenyan mobile-focused services.','Kenyan mobile domain','DOMAIN-MOBI-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".mobi.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,10,NULL,NULL,'.mobi.ke Domain Registration | Vilcom Networks','Register a .mobi.ke domain for Kenyan mobile-focused services. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(30,18,'.info.ke Domain Registration','domain-info-ke','Register a .info.ke domain for Kenyan information portals.','Kenyan info domain','DOMAIN-INFO-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".info.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,11,NULL,NULL,'.info.ke Domain Registration | Vilcom Networks','Register a .info.ke domain for Kenyan information portals. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(31,18,'.me.ke Domain Registration','domain-me-ke','Register a .me.ke domain for your personal Kenyan web presence.','Kenyan personal domain','DOMAIN-ME-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".me.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,12,NULL,NULL,'.me.ke Domain Registration | Vilcom Networks','Register a .me.ke domain for your personal Kenyan web presence. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(32,18,'.sc.ke Domain Registration','domain-sc-ke','Register a .sc.ke domain for Kenyan schools and education.','Kenyan school domain','DOMAIN-SC-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1999.00,NULL,0.00,NULL,NULL,NULL,'[\".sc.ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,0,13,NULL,NULL,'.sc.ke Domain Registration | Vilcom Networks','Register a .sc.ke domain for Kenyan schools and education. Registration KES 1,999/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(33,18,'.ke Domain Registration','domain-ke','Register a premium .ke domain — Kenya\'s top-level domain for maximum local authority.','Kenya\'s premium TLD','DOMAIN-KE','domain',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3500.00,NULL,0.00,NULL,NULL,NULL,'[\".ke Domain Registration\", \"Free DNS Management\", \"Domain Privacy Protection\", \"Easy Domain Transfer\", \"Renewal Reminders\", \"24/7 DNS Management\", \"Instant activation\"]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,1,0,0,14,NULL,NULL,'.ke Domain Registration | Vilcom Networks','Register a premium .ke domain — Kenya\'s top-level domain for maximum local authority. Registration KES 3,500/year.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(34,14,'Web Design','web-design','Vilcom Networks pioneers web design excellence, crafting visually stunning and intuitive experiences that captivate and engage. Elevate your online presence with our visionary designs.','Transforming ideas into digital masterpieces','WEBDEV-DESIGN','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,1,NULL,NULL,'Web Design | Vilcom Networks','Vilcom Networks pioneers web design excellence, crafting visually stunning and intuitive experiences that captivate and engage. Elevate your online presence with our visionary designs.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(35,14,'Web Redesign','web-redesign','Vilcom Networks specializes in web redesign, breathing new life into outdated websites with modern aesthetics and enhanced functionality. Elevate your digital presence with our transformative redesign solutions.','Revitalize your online identity','WEBDEV-REDESIGN','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,2,NULL,NULL,'Web Redesign | Vilcom Networks','Vilcom Networks specializes in web redesign, breathing new life into outdated websites with modern aesthetics and enhanced functionality. Elevate your digital presence with our transformative redesign solutions.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(36,15,'E-Commerce Development','ecommerce-development','Vilcom Networks ecommerce design and development service harnesses cutting-edge technology and intuitive design to create seamless shopping experiences. Elevate your digital storefront and drive sales with our tailored ecommerce solutions.','Empower your online store','WEBDEV-ECOMMERCE','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,3,NULL,NULL,'E-Commerce Development | Vilcom Networks','Vilcom Networks ecommerce design and development service harnesses cutting-edge technology and intuitive design to create seamless shopping experiences. Elevate your digital storefront and drive sales with our tailored ecommerce solutions.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(37,14,'SaaS Development','saas-development','Vilcom Networks Software as a Service development service delivers innovative solutions tailored to your needs, revolutionizing the way you do business. Empower your organization with scalable, cloud-based software that drives efficiency and accelerates growth.','Experience the future of software','WEBDEV-SAAS','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,4,NULL,NULL,'SaaS Development | Vilcom Networks','Vilcom Networks Software as a Service development service delivers innovative solutions tailored to your needs, revolutionizing the way you do business. Empower your organization with scalable, cloud-based software that drives efficiency and accelerates growth.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(38,14,'Page Speed Optimization','page-speed-optimization','Vilcom Networks page speed optimization service turbocharges your website, ensuring lightning-fast load times that captivate users and boost search engine rankings. Accelerate your online success with our expert optimization solutions.','Maximize your online potential','WEBDEV-SPEED','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,5,NULL,NULL,'Page Speed Optimization | Vilcom Networks','Vilcom Networks page speed optimization service turbocharges your website, ensuring lightning-fast load times that captivate users and boost search engine rankings. Accelerate your online success with our expert optimization solutions.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(39,14,'Web Development','web-development','Vilcom Networks web development service pioneers innovation, crafting bespoke solutions that elevate your online presence. From sleek designs to powerful functionality, we redefine the digital landscape, empowering your business for success.','Unlock digital excellence','WEBDEV-GENERAL','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,6,NULL,NULL,'Web Development | Vilcom Networks','Vilcom Networks web development service pioneers innovation, crafting bespoke solutions that elevate your online presence. From sleek designs to powerful functionality, we redefine the digital landscape, empowering your business for success.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(40,14,'Web Maintenance','web-maintenance','Vilcom Networks expert web maintenance service keeps your digital presence running smoothly, ensuring security, performance, and functionality. Trust us to safeguard your online investment and keep your business ahead of the curve.','Ensure your online success','WEBDEV-MAINTENANCE','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,7,NULL,NULL,'Web Maintenance | Vilcom Networks','Vilcom Networks expert web maintenance service keeps your digital presence running smoothly, ensuring security, performance, and functionality. Trust us to safeguard your online investment and keep your business ahead of the curve.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10'),(41,14,'Payment Gateway Integration','payment-gateway-integration','Vilcom Networks seamlessly integrates payment gateways into your online platform, ensuring secure and seamless transactions for your customers. Elevate your ecommerce experience with our expert integration solutions.','Effortless transactions, unparalleled convenience','WEBDEV-PAYMENT','web_development',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,NULL,NULL,NULL,'[]',NULL,NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,0,0,1,8,NULL,NULL,'Payment Gateway Integration | Vilcom Networks','Vilcom Networks seamlessly integrates payment gateways into your online platform, ensuring secure and seamless transactions for your customers. Elevate your ecommerce experience with our expert integration solutions.',NULL,NULL,'2026-03-07 08:11:10','2026-03-07 08:11:10');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quote_requests`
--

DROP TABLE IF EXISTS `quote_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quote_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `quote_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('internet_plan','hosting_package','web_development','cloud_services','cyber_security','network_infrastructure','isp_services','cpe_device','satellite_connectivity','media_services','erp_services','smart_integration','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','under_review','quoted','accepted','rejected','expired','converted_to_subscription') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `general_info` json DEFAULT NULL COMMENT 'Company details, contact info, project overview',
  `technical_requirements` json DEFAULT NULL COMMENT 'Technical specs based on service type',
  `budget_range` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timeline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_start_date` date DEFAULT NULL,
  `assigned_staff_id` bigint unsigned DEFAULT NULL,
  `quoted_price` decimal(12,2) DEFAULT NULL,
  `staff_notes` text COLLATE utf8mb4_unicode_ci,
  `admin_response` text COLLATE utf8mb4_unicode_ci COMMENT 'Response message to customer',
  `quoted_at` timestamp NULL DEFAULT NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  `quote_valid_until` timestamp NULL DEFAULT NULL,
  `customer_response` enum('pending','accepted','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `customer_notes` text COLLATE utf8mb4_unicode_ci,
  `customer_responded_at` timestamp NULL DEFAULT NULL,
  `subscription_id` bigint unsigned DEFAULT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `additional_notes` text COLLATE utf8mb4_unicode_ci,
  `urgency` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'web, mobile, referral',
  `referral_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quote_requests_quote_number_unique` (`quote_number`),
  KEY `quote_requests_assigned_staff_id_foreign` (`assigned_staff_id`),
  KEY `quote_requests_subscription_id_foreign` (`subscription_id`),
  KEY `quote_requests_status_index` (`status`),
  KEY `quote_requests_service_type_index` (`service_type`),
  KEY `quote_requests_quote_number_index` (`quote_number`),
  KEY `quote_requests_created_at_index` (`created_at`),
  KEY `quote_requests_status_created_at_index` (`status`,`created_at`),
  KEY `quote_requests_user_id_index` (`user_id`),
  KEY `quote_requests_product_id_index` (`product_id`),
  CONSTRAINT `quote_requests_assigned_staff_id_foreign` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quote_requests_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quote_requests_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quote_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quote_requests`
--

LOCK TABLES `quote_requests` WRITE;
/*!40000 ALTER TABLE `quote_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `quote_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_has_permissions`
--

LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
INSERT INTO `role_has_permissions` VALUES (2,1),(7,1),(32,1),(35,1),(37,1),(41,1),(42,1),(43,1),(51,1),(52,1),(57,1),(60,1),(61,1),(96,1),(107,1),(114,1),(116,1),(118,1),(137,1),(140,1),(2,2),(3,2),(7,2),(8,2),(26,2),(33,2),(34,2),(36,2),(39,2),(40,2),(44,2),(45,2),(48,2),(53,2),(56,2),(58,2),(59,2),(60,2),(62,2),(64,2),(65,2),(66,2),(67,2),(68,2),(83,2),(87,2),(92,2),(96,2),(97,2),(102,2),(108,2),(109,2),(110,2),(112,2),(115,2),(116,2),(117,2),(118,2),(127,2),(129,2),(130,2),(137,2),(141,2),(1,3),(2,3),(3,3),(4,3),(5,3),(6,3),(7,3),(8,3),(9,3),(10,3),(11,3),(12,3),(13,3),(14,3),(15,3),(16,3),(17,3),(18,3),(19,3),(20,3),(21,3),(22,3),(23,3),(24,3),(25,3),(26,3),(27,3),(28,3),(29,3),(30,3),(31,3),(32,3),(33,3),(34,3),(35,3),(36,3),(37,3),(38,3),(39,3),(40,3),(41,3),(42,3),(43,3),(44,3),(45,3),(46,3),(47,3),(48,3),(49,3),(50,3),(51,3),(52,3),(53,3),(54,3),(55,3),(56,3),(57,3),(58,3),(59,3),(60,3),(61,3),(62,3),(63,3),(64,3),(65,3),(66,3),(67,3),(68,3),(69,3),(70,3),(71,3),(72,3),(73,3),(74,3),(75,3),(76,3),(77,3),(78,3),(79,3),(80,3),(81,3),(82,3),(83,3),(84,3),(85,3),(86,3),(87,3),(88,3),(89,3),(90,3),(91,3),(92,3),(93,3),(94,3),(95,3),(96,3),(97,3),(98,3),(99,3),(100,3),(101,3),(102,3),(103,3),(104,3),(105,3),(106,3),(107,3),(108,3),(109,3),(110,3),(111,3),(112,3),(113,3),(114,3),(115,3),(116,3),(117,3),(118,3),(119,3),(120,3),(121,3),(122,3),(123,3),(124,3),(125,3),(126,3),(127,3),(128,3),(129,3),(130,3),(131,3),(132,3),(133,3),(134,3),(135,3),(136,3),(137,3),(138,3),(139,3),(140,3),(141,3),(142,3),(2,4),(3,4),(6,4),(7,4),(8,4),(26,4),(33,4),(34,4),(36,4),(39,4),(40,4),(44,4),(45,4),(48,4),(53,4),(56,4),(58,4),(59,4),(60,4),(62,4),(64,4),(65,4),(66,4),(67,4),(68,4),(83,4),(87,4),(92,4),(96,4),(97,4),(102,4),(108,4),(109,4),(110,4),(112,4),(115,4),(116,4),(117,4),(118,4),(127,4),(128,4),(129,4),(130,4),(133,4),(137,4),(141,4),(2,5),(3,5),(7,5),(8,5),(26,5),(33,5),(34,5),(36,5),(39,5),(40,5),(44,5),(45,5),(48,5),(53,5),(56,5),(58,5),(59,5),(60,5),(62,5),(64,5),(65,5),(66,5),(67,5),(68,5),(83,5),(84,5),(85,5),(87,5),(88,5),(89,5),(92,5),(96,5),(97,5),(102,5),(108,5),(109,5),(110,5),(112,5),(115,5),(116,5),(117,5),(118,5),(127,5),(129,5),(130,5),(137,5),(141,5),(2,6),(7,6),(58,6),(62,6),(108,6),(115,6),(119,6),(120,6),(121,6),(137,6),(141,6),(2,7),(7,7),(69,7),(70,7),(71,7),(73,7),(74,7),(75,7),(77,7),(81,7),(83,7),(84,7),(85,7),(87,7),(88,7),(89,7),(91,7),(97,7),(98,7),(99,7),(101,7),(102,7),(103,7),(104,7),(106,7),(141,7);
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'client','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(2,'staff','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(3,'admin','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(4,'sales','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(5,'technical_support','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(6,'web_developer','web','2026-03-07 08:11:08','2026-03-07 08:11:08'),(7,'content_manager','web','2026-03-07 08:11:09','2026-03-07 08:11:09');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_invitations`
--

DROP TABLE IF EXISTS `staff_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_invitations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invited_by` bigint unsigned NOT NULL,
  `expires_at` timestamp NOT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','accepted','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_invitations_token_unique` (`token`),
  KEY `staff_invitations_invited_by_foreign` (`invited_by`),
  KEY `staff_invitations_email_index` (`email`),
  KEY `staff_invitations_token_index` (`token`),
  KEY `staff_invitations_status_index` (`status`),
  CONSTRAINT `staff_invitations_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_invitations`
--

LOCK TABLES `staff_invitations` WRITE;
/*!40000 ALTER TABLE `staff_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_addons`
--

DROP TABLE IF EXISTS `subscription_addons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_addons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint unsigned NOT NULL,
  `addon_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `billing_cycle` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','cancelled','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `added_at` date NOT NULL,
  `cancelled_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_addons_subscription_id_addon_id_unique` (`subscription_id`,`addon_id`),
  KEY `subscription_addons_subscription_id_index` (`subscription_id`),
  KEY `subscription_addons_addon_id_index` (`addon_id`),
  KEY `subscription_addons_status_index` (`status`),
  CONSTRAINT `subscription_addons_addon_id_foreign` FOREIGN KEY (`addon_id`) REFERENCES `addons` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `subscription_addons_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_addons`
--

LOCK TABLES `subscription_addons` WRITE;
/*!40000 ALTER TABLE `subscription_addons` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_addons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plan_changes`
--

DROP TABLE IF EXISTS `subscription_plan_changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plan_changes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint unsigned NOT NULL,
  `changed_by` bigint unsigned DEFAULT NULL,
  `from_product_id` bigint unsigned DEFAULT NULL,
  `from_variant_id` bigint unsigned DEFAULT NULL,
  `from_price` decimal(10,2) DEFAULT NULL,
  `from_billing_cycle` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_product_id` bigint unsigned NOT NULL,
  `to_variant_id` bigint unsigned DEFAULT NULL,
  `to_price` decimal(10,2) NOT NULL,
  `to_billing_cycle` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_type` enum('upgrade','downgrade','cycle_change','addon_change','initial') COLLATE utf8mb4_unicode_ci NOT NULL,
  `apply_timing` enum('immediate','next_cycle') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'immediate',
  `proration_credit` decimal(10,2) NOT NULL DEFAULT '0.00',
  `proration_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `net_proration` decimal(10,2) NOT NULL DEFAULT '0.00',
  `days_remaining` int DEFAULT NULL,
  `days_in_cycle` int DEFAULT NULL,
  `effective_date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscription_plan_changes_changed_by_foreign` (`changed_by`),
  KEY `subscription_plan_changes_from_product_id_foreign` (`from_product_id`),
  KEY `subscription_plan_changes_from_variant_id_foreign` (`from_variant_id`),
  KEY `subscription_plan_changes_to_product_id_foreign` (`to_product_id`),
  KEY `subscription_plan_changes_to_variant_id_foreign` (`to_variant_id`),
  KEY `subscription_plan_changes_subscription_id_index` (`subscription_id`),
  KEY `subscription_plan_changes_effective_date_index` (`effective_date`),
  KEY `subscription_plan_changes_change_type_index` (`change_type`),
  CONSTRAINT `subscription_plan_changes_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscription_plan_changes_from_product_id_foreign` FOREIGN KEY (`from_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscription_plan_changes_from_variant_id_foreign` FOREIGN KEY (`from_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscription_plan_changes_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscription_plan_changes_to_product_id_foreign` FOREIGN KEY (`to_product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `subscription_plan_changes_to_variant_id_foreign` FOREIGN KEY (`to_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plan_changes`
--

LOCK TABLES `subscription_plan_changes` WRITE;
/*!40000 ALTER TABLE `subscription_plan_changes` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_plan_changes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_reminders`
--

DROP TABLE IF EXISTS `subscription_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `type` enum('renewal_upcoming','renewal_failed','suspension_warning','suspended','trial_ending','plan_change_applied','cancellation_confirmed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms','in_app','whatsapp') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `status` enum('pending','sent','failed','skipped') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `scheduled_at` timestamp NOT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `payload` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscription_reminders_user_id_foreign` (`user_id`),
  KEY `subscription_reminders_subscription_id_index` (`subscription_id`),
  KEY `subscription_reminders_type_index` (`type`),
  KEY `subscription_reminders_status_index` (`status`),
  KEY `subscription_reminders_scheduled_at_index` (`scheduled_at`),
  CONSTRAINT `subscription_reminders_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscription_reminders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_reminders`
--

LOCK TABLES `subscription_reminders` WRITE;
/*!40000 ALTER TABLE `subscription_reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_status_history`
--

DROP TABLE IF EXISTS `subscription_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_status_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint unsigned NOT NULL,
  `changed_by` bigint unsigned DEFAULT NULL,
  `from_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `changed_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscription_status_history_changed_by_foreign` (`changed_by`),
  KEY `subscription_status_history_subscription_id_index` (`subscription_id`),
  KEY `subscription_status_history_changed_at_index` (`changed_at`),
  CONSTRAINT `subscription_status_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscription_status_history_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_status_history`
--

LOCK TABLES `subscription_status_history` WRITE;
/*!40000 ALTER TABLE `subscription_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `subscription_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `product_variant_id` bigint unsigned DEFAULT NULL,
  `coverage_zone_id` bigint unsigned DEFAULT NULL,
  `billing_cycle` enum('monthly','quarterly','semi_annually','annually') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `base_price` decimal(10,2) NOT NULL,
  `addons_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `setup_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `proration_credit` decimal(10,2) NOT NULL DEFAULT '0.00',
  `proration_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `proration_date` date DEFAULT NULL,
  `status` enum('pending','active','suspended','cancelled','expired','pending_cancellation','pending_upgrade','trial') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `trial_ends_at` date DEFAULT NULL,
  `started_at` date DEFAULT NULL,
  `current_period_start` date NOT NULL,
  `current_period_end` date NOT NULL,
  `next_renewal_at` date DEFAULT NULL,
  `cancelled_at` date DEFAULT NULL,
  `suspended_at` date DEFAULT NULL,
  `expires_at` date DEFAULT NULL,
  `cancel_reason` enum('too_expensive','switching_provider','no_longer_needed','poor_service','moving_area','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancel_notes` text COLLATE utf8mb4_unicode_ci,
  `cancel_at_period_end` tinyint(1) NOT NULL DEFAULT '0',
  `suspension_reason` text COLLATE utf8mb4_unicode_ci,
  `grace_period_days` int NOT NULL DEFAULT '7',
  `grace_period_ends_at` date DEFAULT NULL,
  `pending_product_id` bigint unsigned DEFAULT NULL,
  `pending_variant_id` bigint unsigned DEFAULT NULL,
  `pending_change_type` enum('upgrade','downgrade','cycle_change') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pending_change_date` date DEFAULT NULL,
  `auto_renew` tinyint(1) NOT NULL DEFAULT '1',
  `renewal_reminder_days` int NOT NULL DEFAULT '7',
  `last_reminder_sent_at` timestamp NULL DEFAULT NULL,
  `is_trial` tinyint(1) NOT NULL DEFAULT '0',
  `trial_days` int DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `managed_by` bigint unsigned DEFAULT NULL,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscriptions_subscription_number_unique` (`subscription_number`),
  KEY `subscriptions_product_variant_id_foreign` (`product_variant_id`),
  KEY `subscriptions_coverage_zone_id_foreign` (`coverage_zone_id`),
  KEY `subscriptions_pending_product_id_foreign` (`pending_product_id`),
  KEY `subscriptions_pending_variant_id_foreign` (`pending_variant_id`),
  KEY `subscriptions_created_by_foreign` (`created_by`),
  KEY `subscriptions_managed_by_foreign` (`managed_by`),
  KEY `subscriptions_user_id_index` (`user_id`),
  KEY `subscriptions_product_id_index` (`product_id`),
  KEY `subscriptions_status_index` (`status`),
  KEY `subscriptions_billing_cycle_index` (`billing_cycle`),
  KEY `subscriptions_current_period_end_index` (`current_period_end`),
  KEY `subscriptions_next_renewal_at_index` (`next_renewal_at`),
  KEY `subscriptions_cancel_at_period_end_index` (`cancel_at_period_end`),
  KEY `subscriptions_subscription_number_index` (`subscription_number`),
  CONSTRAINT `subscriptions_coverage_zone_id_foreign` FOREIGN KEY (`coverage_zone_id`) REFERENCES `coverage_zones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscriptions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscriptions_managed_by_foreign` FOREIGN KEY (`managed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscriptions_pending_product_id_foreign` FOREIGN KEY (`pending_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscriptions_pending_variant_id_foreign` FOREIGN KEY (`pending_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscriptions_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `subscriptions_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `testimonials_created_by_foreign` (`created_by`),
  KEY `testimonials_is_approved_is_featured_index` (`is_approved`,`is_featured`),
  CONSTRAINT `testimonials_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model_id` bigint unsigned DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_activities_user_id_index` (`user_id`),
  KEY `user_activities_action_index` (`action`),
  KEY `user_activities_model_type_model_id_index` (`model_type`,`model_id`),
  KEY `user_activities_created_at_index` (`created_at`),
  CONSTRAINT `user_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activities`
--

LOCK TABLES `user_activities` WRITE;
/*!40000 ALTER TABLE `user_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified_at` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `county` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kenya',
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_registration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_pin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_type` enum('individual','business') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'individual',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended','banned','pending_verification') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_verification',
  `suspended_at` timestamp NULL DEFAULT NULL,
  `suspension_reason` text COLLATE utf8mb4_unicode_ci,
  `two_factor_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires_at` timestamp NULL DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `timezone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Africa/Nairobi',
  `language` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `employee_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `is_team_leader` tinyint(1) NOT NULL DEFAULT '0',
  `reports_to` bigint unsigned DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  UNIQUE KEY `users_employee_id_unique` (`employee_id`),
  KEY `users_reports_to_foreign` (`reports_to`),
  KEY `users_email_index` (`email`),
  KEY `users_phone_index` (`phone`),
  KEY `users_status_index` (`status`),
  KEY `users_customer_type_index` (`customer_type`),
  KEY `users_department_index` (`department`),
  KEY `users_employee_id_index` (`employee_id`),
  CONSTRAINT `users_reports_to_foreign` FOREIGN KEY (`reports_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@vilcom.co.ke','2026-03-07 08:11:11','$2y$12$OeDuAzgxSHu3tg41wYmLrOh6n57pXWHZNe1/Wi3YlO5Ndfbc/uShC','+254700000000',NULL,NULL,NULL,NULL,NULL,NULL,'Kenya','Vilcom Networks',NULL,NULL,'business',NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'Africa/Nairobi','en',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 08:11:11','2026-03-07 08:11:11'),(2,'Staff User','staff@vilcom.co.ke','2026-03-07 08:11:11','$2y$12$6a0z5WjTnEhA9xG8ZlBalu9XojzPy3qxxSd4dYoe.q/Ub0sKgPOem','+254711111111',NULL,NULL,NULL,NULL,NULL,NULL,'Kenya','Vilcom Networks',NULL,NULL,'business',NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'Africa/Nairobi','en',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-07 08:11:11','2026-03-07 08:11:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-07 23:06:41
