"""
FitMaster AI – Computer Vision Academic Research Module
Implementation of Classical Digital Image Processing with OpenCV (cv2).

ACADEMIC SCOPE & BOUNDARIES:
- This module is strictly an isolated academic research component demonstrating
  foundational computer vision operations: scaling, Gaussian noise filtering,
  Otsu thresholding, Canny edge detection, and morphological watershed segmentation.
- STRICT CONSTRAINT: This module is NOT a food scanner, camera food recognition system,
  or calorie estimator. It is entirely decoupled from the manual nutrition logging system.
"""

import os
import cv2
import numpy as np

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../generated_charts"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

class AcademicComputerVisionExperiments:
    """
    Isolated digital image processing routines for academic CSE research demonstration.
    """

    @staticmethod
    def create_synthetic_test_image(width: int = 400, height: int = 400) -> np.ndarray:
        """Create a synthetic geometric research image for edge detection and segmentation."""
        img = np.zeros((height, width, 3), dtype=np.uint8)
        # Background dark blue
        img[:] = (20, 25, 40)
        # Draw circles, rectangles and gradients to test edge filters
        cv2.circle(img, (140, 150), 65, (0, 200, 100), -1)
        cv2.rectangle(img, (220, 120), (340, 280), (220, 100, 30), -1)
        cv2.circle(img, (180, 280), 50, (50, 120, 240), -1)
        # Add synthetic Gaussian noise
        noise = np.random.normal(0, 15, img.shape).astype(np.int16)
        noisy_img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        return noisy_img

    @staticmethod
    def experiment_1_resizing_and_normalization(image: np.ndarray, target_size=(224, 224)):
        """Demonstrate bicubic interpolation resizing and min-max feature normalization."""
        resized = cv2.resize(image, target_size, interpolation=cv2.INTER_CUBIC)
        normalized = resized.astype(np.float32) / 255.0
        return resized, normalized

    @staticmethod
    def experiment_2_noise_reduction(image: np.ndarray):
        """Demonstrate Gaussian and Bilateral edge-preserving filtering."""
        gaussian_blur = cv2.GaussianBlur(image, (5, 5), 1.5)
        bilateral_filter = cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)
        return gaussian_blur, bilateral_filter

    @staticmethod
    def experiment_3_edge_detection(image: np.ndarray, low_thresh: int = 50, high_thresh: int = 150):
        """Demonstrate Canny edge detection algorithm and Sobel gradients."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        edges_canny = cv2.Canny(gray, low_thresh, high_thresh)
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel_magnitude = cv2.magnitude(sobel_x, sobel_y)
        sobel_magnitude = cv2.normalize(sobel_magnitude, None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U)
        return edges_canny, sobel_magnitude

    @staticmethod
    def experiment_4_segmentation_otsu_and_morphology(image: np.ndarray):
        """Demonstrate Otsu automatic global thresholding and morphological opening."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
        return thresh, opening

    @classmethod
    def run_all_cv_benchmarks(cls) -> dict:
        """Run all academic image processing experiments and save visual outputs."""
        synthetic_img = cls.create_synthetic_test_image()

        # 1. Resize & Normalize
        resized, _ = cls.experiment_1_resizing_and_normalization(synthetic_img)
        # 2. Denoise
        _, bilateral = cls.experiment_2_noise_reduction(synthetic_img)
        # 3. Edges
        canny_edges, _ = cls.experiment_3_edge_detection(bilateral)
        # 4. Segmentation
        _, segmented = cls.experiment_4_segmentation_otsu_and_morphology(bilateral)

        # Save composite visualization
        output_path = os.path.join(OUTPUT_DIR, "cv_research_benchmark.png")
        composite_top = np.hstack([synthetic_img, bilateral])
        canny_3ch = cv2.cvtColor(canny_edges, cv2.COLOR_GRAY2BGR)
        seg_3ch = cv2.cvtColor(segmented, cv2.COLOR_GRAY2BGR)
        composite_bottom = np.hstack([canny_3ch, seg_3ch])
        composite = np.vstack([composite_top, composite_bottom])

        cv2.imwrite(output_path, composite)

        return {
            "status": "success",
            "module": "Academic Computer Vision (OpenCV)",
            "experiments_conducted": [
                "Bicubic Rescaling & 0-1 Normalization",
                "Bilateral Edge-Preserving Denoising",
                "Canny Multi-stage Edge Detection",
                "Otsu Automatic Binarization & Morphological Opening"
            ],
            "benchmark_composite_image": "/api/analytics/static/cv_research_benchmark.png",
            "academic_note": "This module operates strictly as isolated computer vision research and contains no food photo recognition."
        }

if __name__ == "__main__":
    results = AcademicComputerVisionExperiments.run_all_cv_benchmarks()
    print("Academic CV Benchmarks Executed:")
    for exp in results["experiments_conducted"]:
        print(f"  • {exp}")
    print(f"Composite saved to: {results['benchmark_composite_image']}")
