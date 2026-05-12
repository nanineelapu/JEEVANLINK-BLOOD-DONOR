package com.jeevanlink.matcher.entity;

import java.util.List;
import java.util.Map;

public enum BloodGroup {
    A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE,
    AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE;

    /** Returns the list of donor blood groups that the recipient can accept. */
    public List<BloodGroup> compatibleDonors() {
        return COMPATIBILITY.get(this);
    }

    private static final Map<BloodGroup, List<BloodGroup>> COMPATIBILITY = Map.of(
            O_NEGATIVE,  List.of(O_NEGATIVE),
            O_POSITIVE,  List.of(O_NEGATIVE, O_POSITIVE),
            A_NEGATIVE,  List.of(O_NEGATIVE, A_NEGATIVE),
            A_POSITIVE,  List.of(O_NEGATIVE, O_POSITIVE, A_NEGATIVE, A_POSITIVE),
            B_NEGATIVE,  List.of(O_NEGATIVE, B_NEGATIVE),
            B_POSITIVE,  List.of(O_NEGATIVE, O_POSITIVE, B_NEGATIVE, B_POSITIVE),
            AB_NEGATIVE, List.of(O_NEGATIVE, A_NEGATIVE, B_NEGATIVE, AB_NEGATIVE),
            AB_POSITIVE, List.of(values())
    );

    public String pretty() {
        return switch (this) {
            case A_POSITIVE -> "A+";
            case A_NEGATIVE -> "A-";
            case B_POSITIVE -> "B+";
            case B_NEGATIVE -> "B-";
            case AB_POSITIVE -> "AB+";
            case AB_NEGATIVE -> "AB-";
            case O_POSITIVE -> "O+";
            case O_NEGATIVE -> "O-";
        };
    }
}
