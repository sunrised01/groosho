import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Dashboard({ status, canResetPassword }) {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const twoYearsAgo = currentYear - 2;
    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="row">
                <div className="col-xl-8 mb-6 order-0">
                    <div className="card">
                        <div className="d-flex align-items-start row">
                            <div className="col-sm-7">
                                <div className="card-body">
                                    <h5 className="card-title text-primary mb-3">Congratulations John! 🎉</h5>
                                    <p className="mb-6">
                                        You have done 72% more sales today.<br />Check your new badge in your profile.
                                    </p>
                                    <a href="javascript:;" className="btn btn-sm btn-outline-primary">
                                        View Badges
                                    </a>
                                </div>
                            </div>
                            <div className="col-sm-5 text-center text-sm-left">
                                <div className="card-body pb-0 px-0 px-md-6">
                                    <img
                                        src="../assets/img/illustrations/man-with-laptop.png"
                                        height="175"
                                        className="scaleX-n1-rtl"
                                        alt="View Badge User"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-4 order-1">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-6 mb-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="card-title d-flex align-items-start justify-content-between mb-4">
                                        <div className="avatar flex-shrink-0">
                                            <img
                                                src="../assets/img/icons/unicons/chart-success.png"
                                                alt="chart success"
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="btn p-0"
                                                type="button"
                                                id="cardOpt3"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                            >
                                                <i className="bx bx-dots-vertical-rounded text-muted"></i>
                                            </button>
                                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt3">
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    View More
                                                </a>
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    Delete
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mb-1">Profit</p>
                                    <h4 className="card-title mb-3">$12,628</h4>
                                    <small className="text-success fw-medium">
                                        <i className="bx bx-up-arrow-alt"></i> +72.80%
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-6 mb-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="card-title d-flex align-items-start justify-content-between mb-4">
                                        <div className="avatar flex-shrink-0">
                                            <img
                                                src="../assets/img/icons/unicons/wallet-info.png"
                                                alt="wallet info"
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="btn p-0"
                                                type="button"
                                                id="cardOpt6"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                            >
                                                <i className="bx bx-dots-vertical-rounded text-muted"></i>
                                            </button>
                                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt6">
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    View More
                                                </a>
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    Delete
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mb-1">Sales</p>
                                    <h4 className="card-title mb-3">$4,679</h4>
                                    <small className="text-success fw-medium">
                                        <i className="bx bx-up-arrow-alt"></i> +28.42%
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="col-12 col-xxl-8 order-2 order-md-3 order-xxl-2 mb-6">
                    <div className="card">
                        <div className="row row-bordered g-0">
                            <div className="col-lg-8">
                                <div className="card-header d-flex align-items-center justify-content-between">
                                    <div className="card-title mb-0">
                                        <h5 className="m-0 me-2">Total Revenue</h5>
                                    </div>
                                    <div className="dropdown">
                                        <button
                                            className="btn p-0"
                                            type="button"
                                            id="totalRevenue"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                        >
                                            <i className="bx bx-dots-vertical-rounded bx-lg text-muted"></i>
                                        </button>
                                        <div className="dropdown-menu dropdown-menu-end" aria-labelledby="totalRevenue">
                                            <a className="dropdown-item" href="javascript:void(0);">
                                                Select All
                                            </a>
                                            <a className="dropdown-item" href="javascript:void(0);">
                                                Refresh
                                            </a>
                                            <a className="dropdown-item" href="javascript:void(0);">
                                                Share
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div id="totalRevenueChart" className="px-3"></div>
                            </div>
                            <div className="col-lg-4 d-flex align-items-center">
                                <div className="card-body px-xl-9">
                                    <div className="text-center mb-6">
                                        <div className="btn-group">
                                            <button type="button" className="btn btn-outline-primary">
                                                {previousYear}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                <span className="visually-hidden">Toggle Dropdown</span>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <a className="dropdown-item" href="javascript:void(0);">
                                                        2021
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="javascript:void(0);">
                                                        2020
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="javascript:void(0);">
                                                        2019
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div id="growthChart"></div>
                                    <div className="text-center fw-medium my-6">62% Company Growth</div>

                                    <div className="d-flex gap-3 justify-content-between">
                                        <div className="d-flex">
                                            <div className="avatar me-2">
                                                <span className="avatar-initial rounded-2 bg-label-primary">
                                                    <i className="bx bx-dollar bx-lg text-primary"></i>
                                                </span>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <small>{previousYear}</small>
                                                <h6 className="mb-0">$32.5k</h6>
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <div className="avatar me-2">
                                                <span className="avatar-initial rounded-2 bg-label-info">
                                                    <i className="bx bx-wallet bx-lg text-info"></i>
                                                </span>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <small>{twoYearsAgo}</small>
                                                <h6 className="mb-0">$41.2k</h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Total Revenue */}

                <div className="col-12 col-md-8 col-lg-12 col-xxl-4 order-3 order-md-2">
                    <div className="row">
                        <div className="col-6 mb-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="card-title d-flex align-items-start justify-content-between mb-4">
                                        <div className="avatar flex-shrink-0">
                                            <img
                                                src="../assets/img/icons/unicons/paypal.png"
                                                alt="paypal"
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="btn p-0"
                                                type="button"
                                                id="cardOpt4"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                            >
                                                <i className="bx bx-dots-vertical-rounded text-muted"></i>
                                            </button>
                                            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="cardOpt4">
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    View More
                                                </a>
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    Delete
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mb-1">Payments</p>
                                    <h4 className="card-title mb-3">$2,456</h4>
                                    <small className="text-danger fw-medium">
                                        <i className="bx bx-down-arrow-alt"></i> -14.82%
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 mb-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="card-title d-flex align-items-start justify-content-between mb-4">
                                        <div className="avatar flex-shrink-0">
                                            <img
                                                src="../assets/img/icons/unicons/cc-primary.png"
                                                alt="Credit Card"
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="dropdown">
                                            <button
                                                className="btn p-0"
                                                type="button"
                                                id="cardOpt1"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                            >
                                                <i className="bx bx-dots-vertical-rounded text-muted"></i>
                                            </button>
                                            <div className="dropdown-menu" aria-labelledby="cardOpt1">
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    View More
                                                </a>
                                                <a className="dropdown-item" href="javascript:void(0);">
                                                    Delete
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mb-1">Transactions</p>
                                    <h4 className="card-title mb-3">$14,857</h4>
                                    <small className="text-success fw-medium">
                                        <i className="bx bx-up-arrow-alt"></i> +28.14%
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 mb-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center flex-sm-row flex-column gap-10">
                                        <div className="d-flex flex-sm-column flex-row align-items-start justify-content-between">
                                            <div className="card-title mb-6">
                                                <h5 className="text-nowrap mb-1">Profile Report</h5>
                                                <span className="badge bg-label-warning">YEAR 2022</span>
                                            </div>
                                            <div className="mt-sm-auto">
                                                <span className="text-success text-nowrap fw-medium">
                                                    <i className="bx bx-up-arrow-alt"></i> 68.2%
                                                </span>
                                                <h4 className="mb-0">$84,686k</h4>
                                            </div>
                                        </div>
                                        <div id="profileReportChart"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}