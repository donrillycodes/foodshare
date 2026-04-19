/**
 * Converts a string into a URL-friendly slug
 * 
 * Examples:
 * "Winnipeg Food Bank" → "winnipeg-food-bank"
 * "St. Boniface Community Centre" → "st-boniface-community-centre"
 * "Hope & Help NGO" → "hope-and-help-ngo"
 */
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')           // Replace & with 'and'
        .replace(/[^\w\s-]/g, '')       // Remove special characters
        .replace(/[\s_]+/g, '-')        // Replace spaces and underscores with -
        .replace(/-+/g, '-')            // Replace multiple - with single -
        .replace(/^-+|-+$/g, '');       // Remove leading and trailing -
};

/**
 * Generates a unique slug by appending a number if the base slug already exists
 * 
 * Example:
 * "winnipeg-food-bank" already exists → "winnipeg-food-bank-2"
 */
export const generateUniqueSlug = async (
    text: string,
    checkExists: (slug: string) => Promise<boolean>
    ): Promise<string> => {
    const baseSlug = slugify(text);
    let slug = baseSlug;
    let counter = 2;

    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};