#!/usr/bin/env python3

import json
import re

# Function to clean text (remove hyphens, em dashes, etc.)
def clean_text(text):
    # Replace hyphens, em dashes, and other dash types
    text = re.sub(r'[-–—]', ' ', text)
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_words_file(file_path):
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Split by the section dividers (lines with many dashes)
    sections = re.split(r'-{10,}', content)
    
    # Initialize the result dictionary
    result = {
        "20_words": [],
        "50_words": [],
        "100_words": [],
        "200_words": [],
        "500_words": [],
        "1000_words": []
    }
    
    # Process each section
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        # Identify the section type
        if section.startswith("20 words:"):
            section_type = "20_words"
        elif section.startswith("50 words:"):
            section_type = "50_words"
        elif section.startswith("100 words:"):
            section_type = "100_words"
        elif section.startswith("200 words:"):
            section_type = "200_words"
        elif section.startswith("500 words:"):
            section_type = "500_words"
        elif section.startswith("1000 words:"):
            section_type = "1000_words"
        else:
            # If it doesn't match any known section, skip it
            continue
        
        # Remove the section header
        section_content = re.sub(r'^[^\n]+\n\n', '', section)
        
        # Split into paragraphs
        paragraphs = section_content.split('\n\n')
        
        # Clean and add each paragraph
        for paragraph in paragraphs:
            if paragraph.strip():
                # Clean the text (remove hyphens, etc.)
                cleaned_paragraph = clean_text(paragraph)
                result[section_type].append(cleaned_paragraph)
    
    return result

def main():
    # Parse the words file
    words_data = parse_words_file('words.txt')
    
    # Save the result to a JSON file
    with open('words_collection.json', 'w', encoding='utf-8') as json_file:
        json.dump(words_data, json_file, ensure_ascii=False, indent=2)
    
    print("Successfully converted words.txt to JSON format!")
    print(f"Total paragraphs by section:")
    for section, paragraphs in words_data.items():
        print(f"  {section}: {len(paragraphs)} paragraphs")

if __name__ == "__main__":
    main()