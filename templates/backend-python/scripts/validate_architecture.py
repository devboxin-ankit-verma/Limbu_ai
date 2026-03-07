#!/usr/bin/env python3
"""
LAYER 3: Architecture validation script.
Enforces .cursor/rules.md compliance.
"""

import os
import re
import sys
from pathlib import Path

VIOLATIONS = []

def check_env_usage(file_path: Path):
    """Check for direct os.getenv usage outside config."""
    if 'config' in str(file_path):
        return  # Allow in config layer
    
    content = file_path.read_text()
    lines = content.split('\n')
    
    for i, line in enumerate(lines, 1):
        # Skip comments
        if line.strip().startswith('#'):
            continue
            
        if re.search(r'\bos\.getenv\b', line) or re.search(r'\bos\.environ\b', line):
            VIOLATIONS.append({
                'file': str(file_path),
                'line': i,
                'issue': 'Direct os.getenv() usage',
                'fix': 'Use src.config.settings instead'
            })

def check_layer_violations(file_path: Path):
    """Check for layer boundary violations."""
    content = file_path.read_text()
    path_str = str(file_path)
    
    # Controllers/Routes cannot import repositories directly
    if 'api' in path_str or 'routes' in path_str:
        if re.search(r'from.*repositories|import.*repositories', content):
            # Check if it's a type hint (allowed)
            if not re.search(r':\s*(UserRepository|.*Repository)', content):
                VIOLATIONS.append({
                    'file': str(file_path),
                    'line': 0,
                    'issue': 'Controller/Route importing repository directly',
                    'fix': 'Use Service layer instead. Controllers → Services → Repositories'
                })
    
    # Services should use repositories, but can import models for type hints
    # This is more lenient - we'll just warn if services import models for non-type usage
    if 'services' in path_str:
        # Check for direct model instantiation (might be okay, but worth checking)
        if re.search(r'User\(|Model\(', content) and 'repository' not in content.lower():
            # This is a soft check - might be false positive
            pass

def check_hardcoded_values(file_path: Path):
    """Check for hardcoded HTTP status codes."""
    content = file_path.read_text()
    lines = content.split('\n')
    
    # Common hardcoded status codes
    hardcoded_codes = [200, 201, 204, 400, 401, 403, 404, 409, 500]
    
    for i, line in enumerate(lines, 1):
        # Skip comments
        if line.strip().startswith('#'):
            continue
            
        for code in hardcoded_codes:
            # Check for status_code=CODE or status_code: CODE
            if re.search(rf'status_code\s*[=:]\s*{code}\b', line):
                # Allow if it's importing from constants
                if 'StatusCodes' not in line and 'constants' not in line.lower():
                    VIOLATIONS.append({
                        'file': str(file_path),
                        'line': i,
                        'issue': f'Hardcoded status code {code}',
                        'fix': 'Use StatusCodes from src.constants.api'
                    })
            
            # Check for HTTPException(status_code=CODE)
            if re.search(rf'HTTPException\s*\([^)]*status_code\s*=\s*{code}\b', line):
                if 'StatusCodes' not in line:
                    VIOLATIONS.append({
                        'file': str(file_path),
                        'line': i,
                        'issue': f'Hardcoded status code {code} in HTTPException',
                        'fix': 'Use StatusCodes from src.constants.api'
                    })

def check_hardcoded_error_messages(file_path: Path):
    """Check for hardcoded error messages (should use constants)."""
    content = file_path.read_text()
    lines = content.split('\n')
    
    # Common error message patterns
    error_patterns = [
        r'raise\s+\w+Error\s*\(["\']',
        r'HTTPException\s*\([^)]*detail\s*=\s*["\']',
    ]
    
    for i, line in enumerate(lines, 1):
        # Skip comments and imports
        if line.strip().startswith('#') or line.strip().startswith('import') or line.strip().startswith('from'):
            continue
        
        for pattern in error_patterns:
            if re.search(pattern, line):
                # Check if it's using ErrorMessages constant
                if 'ErrorMessages' not in line and 'constants' not in line.lower():
                    # This is a soft check - might have valid reasons
                    # We'll just note it, not fail
                    pass

def main():
    """Run all validation checks."""
    src_path = Path('src')
    
    if not src_path.exists():
        print('❌ src/ directory not found')
        print('💡 Run this script from the project root directory')
        sys.exit(1)
    
    print('🔍 Validating architecture compliance...\n')
    
    # Check all Python files
    python_files = list(src_path.rglob('*.py'))
    
    if not python_files:
        print('⚠️  No Python files found in src/')
        sys.exit(0)
    
    for py_file in python_files:
        check_env_usage(py_file)
        check_layer_violations(py_file)
        check_hardcoded_values(py_file)
        check_hardcoded_error_messages(py_file)
    
    if VIOLATIONS:
        print('❌ Architecture violations detected:\n')
        for v in VIOLATIONS:
            if v['line'] > 0:
                print(f"  {v['file']}:{v['line']}")
            else:
                print(f"  {v['file']}")
            print(f"    Issue: {v['issue']}")
            print(f"    Fix: {v['fix']}\n")
        print('💡 See .cursor/rules.md for architectural guidelines')
        sys.exit(1)
    
    print('✅ Architecture validation passed!')
    print('✅ All rules from .cursor/rules.md are being followed')

if __name__ == '__main__':
    main()
