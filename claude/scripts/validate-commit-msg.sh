#!/usr/bin/env bash

# Usage: validate-commit-msg.sh "subject line" "body text"
# Or pipe a full commit message: cat msg.txt | validate-commit-msg.sh

input=$(cat)
subject=$(echo "$input" | head -1)
body=$(echo "$input" | tail -n +3)

errors=()

# Validate subject
subject_len=${#subject}
if [ "$subject_len" -gt 50 ]; then
  errors+=("Subject is $subject_len chars (max 50): $subject")
fi

# Validate body line lengths
line_num=2
while IFS= read -r line; do
  line_num=$((line_num + 1))
  len=${#line}
  if [ "$len" -gt 72 ]; then
    errors+=("Line $line_num is $len chars (max 72): $line")
  fi
done <<< "$body"

if [ ${#errors[@]} -eq 0 ]; then
  echo "OK"
  exit 0
else
  for err in "${errors[@]}"; do
    echo "ERROR: $err"
  done
  exit 1
fi
