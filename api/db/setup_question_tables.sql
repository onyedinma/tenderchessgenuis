-- Create question_banks table if it doesn't exist
CREATE TABLE IF NOT EXISTS `question_banks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `section_type` enum('1','2') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add is_active column if it doesn't exist
ALTER TABLE `question_banks` 
ADD COLUMN IF NOT EXISTS `is_active` tinyint(1) NOT NULL DEFAULT 0;

-- Create questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bank_id` int(11) NOT NULL,
  `question_text` text DEFAULT NULL,
  `correct_answer` varchar(255) DEFAULT NULL,
  `position` text NOT NULL COMMENT 'JSON containing starting_fen and solution_fen',
  `question_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bank_id` (`bank_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`bank_id`) REFERENCES `question_banks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 