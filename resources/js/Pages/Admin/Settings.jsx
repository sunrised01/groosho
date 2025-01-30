import React, { useState } from "react";
import AppLayout from '@/Pages/Admin/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Settings() {
    const { data, setData, post } = useForm({
        siteTitle: '',
        tagline: '',
        adminEmail: '',
        logo: null,
        favicon: null,
        timezone: 'UTC',
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            setData((prevData) => ({
                ...prevData,
                [name]: file,
            }));

            // Preview the image for the logo and favicon
            if (name === 'logo') {
                setLogoPreview(URL.createObjectURL(file));
            } else if (name === 'favicon') {
                setFaviconPreview(URL.createObjectURL(file));
            }
        } else {
            setData({
                ...data,
                [name]: value,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit the form data to the Laravel backend via Inertia
        post(route('settings.save'), data);
    };

    return (
        <AppLayout>
            <Head title="Settings" />
            <div className="row">
                <div className="col-xxl">
                    <div className="card mb-12">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Site Title */}
                                <div className="row mb-6">
                                    <label className="col-sm-2 col-form-label" htmlFor="siteTitle">
                                        Site Title
                                    </label>
                                    <div className="col-sm-10">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="siteTitle"
                                            name="siteTitle"
                                            value={data.siteTitle}
                                            onChange={handleChange}
                                            placeholder="Your Website Title"
                                        />
                                    </div>
                                </div>

                                {/* Tagline */}
                                <div className="row mb-6">
                                    <label className="col-sm-2 col-form-label" htmlFor="tagline">
                                        Tagline
                                    </label>
                                    <div className="col-sm-10">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="tagline"
                                            name="tagline"
                                            value={data.tagline}
                                            onChange={handleChange}
                                            placeholder="Your Website Tagline"
                                        />
                                    </div>
                                </div>

                                {/* Admin Email */}
                                <div className="row mb-6">
                                    <label className="col-sm-2 col-form-label" htmlFor="adminEmail">
                                        Admin Email
                                    </label>
                                    <div className="col-sm-10">
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="adminEmail"
                                            name="adminEmail"
                                            value={data.adminEmail}
                                            onChange={handleChange}
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Website Logo */}
                                <div className="row mb-6">
                                    <label className="col-sm-2 col-form-label" htmlFor="logo">
                                        Website Logo
                                    </label>
                                    <div className="col-sm-10">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => document.getElementById('logoInput').click()}
                                        >
                                            Select Logo
                                        </button>
                                        <input
                                            type="file"
                                            id="logoInput"
                                            name="logo"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleChange}
                                        />
                                        {logoPreview && (
                                            <div className="mt-2">
                                                <img src={logoPreview} alt="Logo Preview" width="100" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Favicon */}
                                <div className="row mb-6">
                                    <label className="col-sm-2 col-form-label" htmlFor="favicon">
                                        Favicon
                                    </label>
                                    <div className="col-sm-10">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => document.getElementById('faviconInput').click()}
                                        >
                                            Select Favicon
                                        </button>
                                        <input
                                            type="file"
                                            id="faviconInput"
                                            name="favicon"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleChange}
                                        />
                                        {faviconPreview && (
                                            <div className="mt-2">
                                                <img src={faviconPreview} alt="Favicon Preview" width="30" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Default Timezone */}
                                <div className="row mb-6">
                                    <label className="col-sm-2 col-form-label" htmlFor="timezone">
                                        Timezone
                                    </label>
                                    <div className="col-sm-10">
                                        <select
                                            className="form-control"
                                            id="timezone"
                                            name="timezone"
                                            value={data.timezone}
                                            onChange={handleChange}
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="GMT">GMT</option>
                                            <option value="America/New_York">America/New York</option>
                                            <option value="Europe/London">Europe/London</option>
                                            {/* Add more timezones as needed */}
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="row justify-content-end">
                                    <div className="col-sm-10">
                                        <button type="submit" className="btn btn-primary">
                                            Save Settings
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}