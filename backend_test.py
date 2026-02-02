import requests
import sys
import json
from datetime import datetime

class RareRevisitAPITester:
    def __init__(self, base_url="https://fragrance-hub-241.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_product_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_analytics(self):
        """Test analytics endpoint"""
        return self.run_test("Analytics", "GET", "analytics", 200)

    def test_social_accounts(self):
        """Test social accounts endpoint"""
        return self.run_test("Social Accounts", "GET", "social-accounts", 200)

    def test_get_products_empty(self):
        """Test getting products (initially empty)"""
        return self.run_test("Get Products (Empty)", "GET", "products", 200)

    def test_create_product(self):
        """Test creating a product"""
        product_data = {
            "name": "Golden Oud Test",
            "description": "A luxurious test fragrance with golden oud notes",
            "price": 299.99,
            "image_url": "https://example.com/golden-oud.jpg",
            "category": "Unisex",
            "mood": "sensual",
            "sizes": ["50ml", "100ml"]
        }
        
        success, response = self.run_test("Create Product", "POST", "products", 200, data=product_data)
        if success and 'id' in response:
            self.created_product_id = response['id']
            print(f"   Created product ID: {self.created_product_id}")
        return success, response

    def test_get_products_with_data(self):
        """Test getting products after creation"""
        return self.run_test("Get Products (With Data)", "GET", "products", 200)

    def test_get_single_product(self):
        """Test getting a single product by ID"""
        if not self.created_product_id:
            print("❌ Skipped - No product ID available")
            return False, {}
        
        return self.run_test("Get Single Product", "GET", f"products/{self.created_product_id}", 200)

    def test_content_generation(self):
        """Test AI content generation"""
        content_data = {
            "prompt": "Create a caption for Golden Oud perfume highlighting luxury and warmth",
            "platform": "instagram",
            "tone": "elegant",
            "product_name": "Golden Oud"
        }
        
        return self.run_test("Content Generation", "POST", "content/generate", 200, data=content_data)

    def test_create_post(self):
        """Test creating a social media post"""
        post_data = {
            "platform": "instagram",
            "content": "Experience the luxury of Golden Oud - where tradition meets modern elegance. #RareRevisit #LuxuryFragrance",
            "caption": "Golden Oud Launch",
            "status": "draft"
        }
        
        return self.run_test("Create Post", "POST", "posts", 200, data=post_data)

    def test_get_posts(self):
        """Test getting posts"""
        return self.run_test("Get Posts", "GET", "posts", 200)

    def test_delete_product(self):
        """Test deleting a product"""
        if not self.created_product_id:
            print("❌ Skipped - No product ID available")
            return False, {}
        
        return self.run_test("Delete Product", "DELETE", f"products/{self.created_product_id}", 200)

def main():
    print("🚀 Starting Rare Revisit API Tests...")
    print("=" * 50)
    
    tester = RareRevisitAPITester()
    
    # Run all tests in sequence
    test_methods = [
        tester.test_root_endpoint,
        tester.test_analytics,
        tester.test_social_accounts,
        tester.test_get_products_empty,
        tester.test_create_product,
        tester.test_get_products_with_data,
        tester.test_get_single_product,
        tester.test_content_generation,
        tester.test_create_post,
        tester.test_get_posts,
        tester.test_delete_product
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())