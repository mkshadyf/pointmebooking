#!/bin/bash

# Find all TypeScript files and replace ToastService.toast.* with ToastService.*
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ToastService\.toast\.success/ToastService.success/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ToastService\.toast\.error/ToastService.error/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ToastService\.toast\.warning/ToastService.warning/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/ToastService\.toast\.info/ToastService.info/g'

echo "Done!" 