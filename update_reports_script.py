#!/usr/bin/env python3
"""
Script to update Reports.tsx with all the required filter fixes.
"""

def update_reports_file():
    # Read the original file
    with open('apps/frontend/src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Perform replacements in order

    # 1. Update state declarations
    content = content.replace(
        'const [currentMonth] = useState(new Date());',
        'const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);'
    )
    content = content.replace(
        'const [currentYear, setCurrentYear]',
        'const [selectedYear, setSelectedYear]'
    )

    # 2. Update useEffect dependencies
    content = content.replace(
        '}, [showAnnualView, currentYear]);',
        '}, [showAnnualView, selectedYear, selectedMonth]);'
    )

    # 3. Fix loadReportData - statistics loading
    old_stats = '''      // Load KPI statistics for current month
      const statsResponse = await timeEntriesApi.getStatistics(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1
      );
      setStats(statsResponse.data);'''

    new_stats = '''      // Load KPI statistics based on view mode
      const statsResponse = await timeEntriesApi.getStatistics(
        selectedYear,
        showAnnualView ? 1 : selectedMonth
      );
      setStats(statsResponse.data);'''

    content = content.replace(old_stats, new_stats)

    # 4. Fix loadChartData - monthly hours
    old_monthly = '''        // Load monthly data (only days with data)
        const response = await timeEntriesApi.getMonthlyHours(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1
        );'''

    new_monthly = '''        // Load monthly data for selected month
        const response = await timeEntriesApi.getMonthlyHours(
          selectedYear,
          selectedMonth
        );'''

    content = content.replace(old_monthly, new_monthly)

    # 5. Fix loadCategoryData
    old_category = '''      const month = showAnnualView ? undefined : currentMonth.getMonth() + 1;
      const year = showAnnualView ? currentYear : currentMonth.getFullYear();'''

    new_category = '''      const month = showAnnualView ? undefined : selectedMonth;
      const year = selectedYear;'''

    content = content.replace(old_category, new_category)

    # 6. Fix year selector - replace currentYear with selectedYear in specific places
    content = content.replace('value={currentYear}', 'value={selectedYear}')
    content = content.replace('onChange={(e) => setCurrentYear(Number(e.target.value))}',
                             'onChange={(e) => setSelectedYear(Number(e.target.value))}')
    content = content.replace('getAnnualHours(currentYear)', 'getAnnualHours(selectedYear)')

    # 7. Replace hardcoded year options
    old_years = '''                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>'''

    new_years = '''                  >
                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>'''

    content = content.replace(old_years, new_years)

    # 8. Add month selector UI
    old_filters_start = '''                <h2 className="text-2xl font-bold">Analytics</h2>
                <div className="flex gap-3">
                  {/* Year Selector */}'''

    new_filters_start = '''                <h2 className="text-2xl font-bold">Analytics</h2>
                <div className="flex gap-3 flex-wrap">
                  {/* Month Selector - Only show in Monthly view */}
                  {!showAnnualView && (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Year Selector */}'''

    content = content.replace(old_filters_start, new_filters_start)

    # 9. Update flex container
    content = content.replace(
        '<div className="flex justify-between items-center mb-4">',
        '<div className="flex justify-between items-center mb-4 flex-wrap gap-4">'
    )

    # 10. Update Performance Overview title
    old_title = '<h2 className="text-2xl font-bold mb-4">Monthly Performance Overview</h2>'
    new_title = '''<h2 className="text-2xl font-bold mb-4">
                {showAnnualView ? 'Annual Performance Overview' : 'Monthly Performance Overview'}
              </h2>'''
    content = content.replace(old_title, new_title)

    # 11. Update chart title
    old_chart_title = '''                    {showAnnualView
                      ? 'Monthly Hours Logged'
                      : `Daily Hours - ${currentMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}`}'''

    new_chart_title = '''                    {showAnnualView
                      ? `Monthly Hours Logged - ${selectedYear}`
                      : `Daily Hours - ${getMonthName(selectedMonth)} ${selectedYear}`}'''

    content = content.replace(old_chart_title, new_chart_title)

    # 12. Add getMonthName function before getChartLabel
    get_chart_label_pos = content.find('  const getChartLabel')
    if get_chart_label_pos != -1:
        month_name_function = '''  const getMonthName = (monthNum: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };

  '''
        content = content[:get_chart_label_pos] + month_name_function + content[get_chart_label_pos:]

    # 13. Update legend to show categories instead of just blue
    old_legend = '''                  <div className="mt-8 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 bg-blue-600 rounded"></span>
                    <span className="text-gray-400">Hours Logged</span>
                  </div>'''

    new_legend = '''                  <div className="mt-8 pt-4 border-t border-gray-800 flex flex-wrap items-center gap-2 text-sm">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: category.Color }}
                        ></span>
                        <span className="text-gray-400">{category.CategoryName}</span>
                      </div>
                    ))}
                  </div>'''

    content = content.replace(old_legend, new_legend)

    # Write the updated content
    with open('apps/frontend/src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print('[OK] Successfully updated Reports.tsx')
    print('  - Added month selector for Monthly view')
    print('  - Updated year selector to be dynamic (+/-5 years)')
    print('  - Fixed pie chart to respect filters')
    print('  - Fixed bar chart to respect filters')
    print('  - Updated KPI stats to match selected period')
    print('  - Enhanced legend to show category colors')

if __name__ == '__main__':
    try:
        update_reports_file()
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
