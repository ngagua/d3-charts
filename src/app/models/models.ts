export interface Employee {
    id: string
    employee_name: string
    employee_salary: number
    employee_age: number
    profile_image: string
}

export interface Browser {
    name: string
    now: number
    before: number
}

export interface PieDataElement {
    id: string | number
    label: string
    value: number
}

export interface PieData {
    data: PieDataElement[]
    title: string
}

export interface PieConfig {
    innerRadiusCoef: number
    hiddenOpacity: number
    legendItem: {
        symbolSize: number
        height: number
        fontSize: number
        textSeparator: number
    }
    transition: number
    arcs: {
        stroke: string
        strokeWidth: number
        radius: number
        padAngle: number
    }
    margins: ChartMargins
}

export interface ChartMargins {
    top: number
    right: number
    bottom: number
    left: number
}

export interface CovidData {
    date: string
    dateChecked: string
    death: number
    deathIncrease: number
    hash: string
    hospitalized: number
    hospitalizedCumulative: number
    hospitalizedCurrently: number
    hospitalizedIncrease: number
    inIcuCumulative: number
    inIcuCurrently: number
    lastModified: string
    negative: number
    negativeIncrease: number
    onVentilatorCumulative: number
    onVentilatorCurrently: number
    pending: number
    posNeg: number
    positive: number
    positiveIncrease: number
    recovered: number
    states: number
    total: number
    totalTestResults: number
    totalTestResultsIncrease: number
}

export interface MenuItem {
    menuItemTitle: string
    navigationLink?: string
    icon: string
}

export interface USSpendingData {
    Department: string

    [year: string]: string
}

export interface USSpendingDataElement {
    department: string
    year: string
    expense: number
}

export interface MappedForGroupedData {
    year: number
    data: USSpendingDataElement[]
}

export interface MappedForLineChart {
    year: string
    [Department.DepartmentOfDefenseMilitaryPrograms]: number
    [Department.DepartmentOfEducation]: number
    [Department.DepartmentOfHealthAndHumanServices]: number
    [Department.DepartmentOfHomelandSecurity]: number
}

export enum Department {
    DepartmentOfDefenseMilitaryPrograms = 'Department of Defense - Military Programs',
    DepartmentOfEducation = 'Department of Education',
    DepartmentOfHealthAndHumanServices = 'Department of Health and Human Services',
    DepartmentOfHomelandSecurity = 'Department of Homeland Security',
}
