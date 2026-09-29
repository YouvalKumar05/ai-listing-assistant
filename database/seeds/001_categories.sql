-- =============================================================================
-- Seed: 001_categories.sql
-- Description: Seed category hierarchy
-- =============================================================================

-- Helper function: convert path to slug
CREATE OR REPLACE FUNCTION path_to_slug(p TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(p, '[^a-zA-Z0-9 ]', '', 'g'),
            '[ ]+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Electronics
-- =============================================================================
INSERT INTO categories (name, path, slug) VALUES ('Electronics', 'Electronics', 'electronics');

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Cameras & Photography', 'Electronics > Cameras & Photography', 'electronics-cameras-photography'
FROM categories WHERE path = 'Electronics';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'DSLR Cameras', 'Electronics > Cameras & Photography > DSLR Cameras', 'electronics-cameras-photography-dslr-cameras'
FROM categories WHERE path = 'Electronics > Cameras & Photography';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Mirrorless Cameras', 'Electronics > Cameras & Photography > Mirrorless Cameras', 'electronics-cameras-photography-mirrorless-cameras'
FROM categories WHERE path = 'Electronics > Cameras & Photography';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Point & Shoot', 'Electronics > Cameras & Photography > Point & Shoot', 'electronics-cameras-photography-point-shoot'
FROM categories WHERE path = 'Electronics > Cameras & Photography';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Film Cameras', 'Electronics > Cameras & Photography > Film Cameras', 'electronics-cameras-photography-film-cameras'
FROM categories WHERE path = 'Electronics > Cameras & Photography';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Camera Lenses', 'Electronics > Cameras & Photography > Camera Lenses', 'electronics-cameras-photography-camera-lenses'
FROM categories WHERE path = 'Electronics > Cameras & Photography';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Camera Accessories', 'Electronics > Cameras & Photography > Accessories', 'electronics-cameras-photography-accessories'
FROM categories WHERE path = 'Electronics > Cameras & Photography';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Computers', 'Electronics > Computers', 'electronics-computers'
FROM categories WHERE path = 'Electronics';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Laptops', 'Electronics > Computers > Laptops', 'electronics-computers-laptops'
FROM categories WHERE path = 'Electronics > Computers';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Desktops', 'Electronics > Computers > Desktops', 'electronics-computers-desktops'
FROM categories WHERE path = 'Electronics > Computers';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Computer Accessories', 'Electronics > Computers > Accessories', 'electronics-computers-accessories'
FROM categories WHERE path = 'Electronics > Computers';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Mobile Phones', 'Electronics > Mobile Phones', 'electronics-mobile-phones'
FROM categories WHERE path = 'Electronics';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Tablets', 'Electronics > Tablets', 'electronics-tablets'
FROM categories WHERE path = 'Electronics';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Audio', 'Electronics > Audio', 'electronics-audio'
FROM categories WHERE path = 'Electronics';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Headphones', 'Electronics > Audio > Headphones', 'electronics-audio-headphones'
FROM categories WHERE path = 'Electronics > Audio';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Speakers', 'Electronics > Audio > Speakers', 'electronics-audio-speakers'
FROM categories WHERE path = 'Electronics > Audio';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Earphones', 'Electronics > Audio > Earphones', 'electronics-audio-earphones'
FROM categories WHERE path = 'Electronics > Audio';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Gaming', 'Electronics > Gaming', 'electronics-gaming'
FROM categories WHERE path = 'Electronics';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'TV & Home Theatre', 'Electronics > TV & Home Theatre', 'electronics-tv-home-theatre'
FROM categories WHERE path = 'Electronics';

-- =============================================================================
-- Fashion
-- =============================================================================
INSERT INTO categories (name, path, slug) VALUES ('Fashion', 'Fashion', 'fashion');

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Men', 'Fashion > Men', 'fashion-men'
FROM categories WHERE path = 'Fashion';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Men Clothing', 'Fashion > Men > Clothing', 'fashion-men-clothing'
FROM categories WHERE path = 'Fashion > Men';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Men Shoes', 'Fashion > Men > Shoes', 'fashion-men-shoes'
FROM categories WHERE path = 'Fashion > Men';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Men Accessories', 'Fashion > Men > Accessories', 'fashion-men-accessories'
FROM categories WHERE path = 'Fashion > Men';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Men Watches', 'Fashion > Men > Watches', 'fashion-men-watches'
FROM categories WHERE path = 'Fashion > Men';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Women', 'Fashion > Women', 'fashion-women'
FROM categories WHERE path = 'Fashion';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Women Clothing', 'Fashion > Women > Clothing', 'fashion-women-clothing'
FROM categories WHERE path = 'Fashion > Women';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Women Shoes', 'Fashion > Women > Shoes', 'fashion-women-shoes'
FROM categories WHERE path = 'Fashion > Women';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Women Accessories', 'Fashion > Women > Accessories', 'fashion-women-accessories'
FROM categories WHERE path = 'Fashion > Women';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Women Watches', 'Fashion > Women > Watches', 'fashion-women-watches'
FROM categories WHERE path = 'Fashion > Women';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Handbags', 'Fashion > Handbags', 'fashion-handbags'
FROM categories WHERE path = 'Fashion';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Sunglasses', 'Fashion > Sunglasses', 'fashion-sunglasses'
FROM categories WHERE path = 'Fashion';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Jewellery', 'Fashion > Jewellery', 'fashion-jewellery'
FROM categories WHERE path = 'Fashion';

-- =============================================================================
-- Home & Garden
-- =============================================================================
INSERT INTO categories (name, path, slug) VALUES ('Home & Garden', 'Home & Garden', 'home-garden');

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Furniture', 'Home & Garden > Furniture', 'home-garden-furniture'
FROM categories WHERE path = 'Home & Garden';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Kitchen', 'Home & Garden > Kitchen', 'home-garden-kitchen'
FROM categories WHERE path = 'Home & Garden';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Home Decor', 'Home & Garden > Home Decor', 'home-garden-home-decor'
FROM categories WHERE path = 'Home & Garden';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Garden', 'Home & Garden > Garden', 'home-garden-garden'
FROM categories WHERE path = 'Home & Garden';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Lighting', 'Home & Garden > Lighting', 'home-garden-lighting'
FROM categories WHERE path = 'Home & Garden';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Appliances', 'Home & Garden > Appliances', 'home-garden-appliances'
FROM categories WHERE path = 'Home & Garden';

-- =============================================================================
-- Sports
-- =============================================================================
INSERT INTO categories (name, path, slug) VALUES ('Sports', 'Sports', 'sports');

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Fitness Equipment', 'Sports > Fitness Equipment', 'sports-fitness-equipment'
FROM categories WHERE path = 'Sports';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Outdoor & Adventure', 'Sports > Outdoor & Adventure', 'sports-outdoor-adventure'
FROM categories WHERE path = 'Sports';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Cycling', 'Sports > Cycling', 'sports-cycling'
FROM categories WHERE path = 'Sports';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Cricket', 'Sports > Cricket', 'sports-cricket'
FROM categories WHERE path = 'Sports';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Football', 'Sports > Football', 'sports-football'
FROM categories WHERE path = 'Sports';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Other Sports Equipment', 'Sports > Other Sports Equipment', 'sports-other-sports-equipment'
FROM categories WHERE path = 'Sports';

-- =============================================================================
-- Collectibles
-- =============================================================================
INSERT INTO categories (name, path, slug) VALUES ('Collectibles', 'Collectibles', 'collectibles');

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Trading Cards', 'Collectibles > Trading Cards', 'collectibles-trading-cards'
FROM categories WHERE path = 'Collectibles';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Memorabilia', 'Collectibles > Memorabilia', 'collectibles-memorabilia'
FROM categories WHERE path = 'Collectibles';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Antiques', 'Collectibles > Antiques', 'collectibles-antiques'
FROM categories WHERE path = 'Collectibles';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Coins & Currency', 'Collectibles > Coins & Currency', 'collectibles-coins-currency'
FROM categories WHERE path = 'Collectibles';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Art', 'Collectibles > Art', 'collectibles-art'
FROM categories WHERE path = 'Collectibles';

-- =============================================================================
-- Books & Media
-- =============================================================================
INSERT INTO categories (name, path, slug) VALUES ('Books & Media', 'Books & Media', 'books-media');

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Fiction', 'Books & Media > Fiction', 'books-media-fiction'
FROM categories WHERE path = 'Books & Media';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Non-Fiction', 'Books & Media > Non-Fiction', 'books-media-non-fiction'
FROM categories WHERE path = 'Books & Media';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Academic', 'Books & Media > Academic', 'books-media-academic'
FROM categories WHERE path = 'Books & Media';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Comics & Manga', 'Books & Media > Comics & Manga', 'books-media-comics-manga'
FROM categories WHERE path = 'Books & Media';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Music', 'Books & Media > Music', 'books-media-music'
FROM categories WHERE path = 'Books & Media';

INSERT INTO categories (parent_id, name, path, slug)
SELECT id, 'Movies & TV', 'Books & Media > Movies & TV', 'books-media-movies-tv'
FROM categories WHERE path = 'Books & Media';

-- Cleanup helper function
DROP FUNCTION IF EXISTS path_to_slug(TEXT);
